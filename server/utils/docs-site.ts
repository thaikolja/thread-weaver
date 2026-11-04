/** Map a `/docs` URL onto the static Docus build. */
import { existsSync, realpathSync, statSync } from 'node:fs'

/** Join without letting an absolute piece wipe the root. */
import { resolve, sep }                       from 'node:path'

/** One file from the Docus output, and the status the site should send. */
export interface DocsAsset {
  file: string
  status: 200 | 404
}

/** Types the browser needs. A module script is refused when the type is missing. */
const CONTENT_TYPES: Record<string, string> = {
  css:         'text/css; charset=utf-8',
  html:        'text/html; charset=utf-8',
  ico:         'image/x-icon',
  js:          'text/javascript; charset=utf-8',
  json:        'application/json; charset=utf-8',
  map:         'application/json; charset=utf-8',
  md:          'text/markdown; charset=utf-8',
  mjs:         'text/javascript; charset=utf-8',
  png:         'image/png',
  svg:         'image/svg+xml',
  ttf:         'font/ttf',
  txt:         'text/plain; charset=utf-8',
  wasm:        'application/wasm',
  webmanifest: 'application/manifest+json',
  woff2:       'font/woff2',
  xml:         'application/xml; charset=utf-8',
  xsl:         'application/xml; charset=utf-8'
}

/** `Content-Type` for a file the docs build actually contains. */
export function docsContentType(file: string): string {
  /** The last suffix, so `app.js` and `notes.md` both match. */
  const extension = file.split('.').pop()?.toLowerCase() ?? ''

  // Fall back to a generic binary type for anything unknown.
  return CONTENT_TYPES[extension] ?? 'application/octet-stream'
}

/** True when `file` is a real file that stays inside the docs build. */
function fileInside(root: string, relative: string): string | null {
  /** `..` would walk out of the build. A missing piece is just a miss. */
  if (!relative || relative.split('/').includes('..')) {
    // Refuse paths that try to leave the docs folder.
    return null
  }

  /** Absolute candidate under the Docus output. */
  const file = resolve(root, relative)

  // Nothing to serve unless this is a real file.
  if (!existsSync(file) || !statSync(file).isFile()) {
    // Missing paths are not assets.
    return null
  }

  /** Follow links, then refuse anything that left the build directory. */
  const realRoot = realpathSync(root)

  // Resolve the candidate after following any symlinks.
  const realFile = realpathSync(file)

  // A trailing separator keeps `/docs-other` from matching `/docs`.
  const prefix = realRoot.endsWith(sep) ? realRoot : `${realRoot}${sep}`

  // The link points outside the docs build.
  if (realFile !== realRoot && !realFile.startsWith(prefix)) {
    // Refuse anything that escaped the root.
    return null
  }

  // This file stays inside the build.
  return realFile
}

/**
 * Find the static file for a docs URL.
 * `/docs/guide` reads `guide.html`. Anything outside `/docs` is left to the editor.
 */
export function resolveDocsAsset(root: string, pathname: string): DocsAsset | null {
  // Anything outside `/docs` is left to the editor.
  if (pathname !== '/docs' && !pathname.startsWith('/docs/')) {
    // Not a guides URL.
    return null
  }

  // No docs build on disk means nothing to serve.
  if (!existsSync(root)) {
    // The guides have not been generated yet.
    return null
  }

  /** Path under `/docs`, still encoded. */
  let relative = pathname.slice('/docs'.length)

  // Decode the URL so file names with spaces still work.
  try {
    // `%20` and friends become their real characters.
    relative = decodeURIComponent(relative)
  } catch {
    // A broken escape sequence is a bad URL.
    return null
  }

  // A null byte has no place in a file name.
  if (relative.includes('\0')) {
    // Refuse the request rather than touching the filesystem.
    return null
  }

  /** Drop the slashes Nuxt and Docus add around the page name. */
  const bare = relative.replace(/^\/+/, '').replace(/\/+$/, '')

  /** A `..` segment is someone walking out of the guides. */
  if (bare.split('/').includes('..')) {
    // Do not resolve paths that climb above the docs root.
    return null
  }

  /** Exact file, then the `.html` page, then a folder index. */
  const names = bare
    ? [ bare, `${bare}.html`, `${bare}/index.html` ]
    : [ 'index.html' ]

  /** First hit wins. A directory such as `introduction/_payload.json` is not a page. */
  for (const name of names) {
    // Check this candidate against the docs root.
    const file = fileInside(root, name)

    // Found a real file for this URL.
    if (file) {
      // Use the first match in priority order.
      return { file, status: 200 }
    }
  }

  /** The Docus 404, so a bad guide URL stays inside the docs site. */
  const missing = fileInside(root, '404.html')

  // Serve the guides' own not-found page when it exists.
  if (missing) {
    // Keep a bad guide URL inside the docs site.
    return { file: missing, status: 404 }
  }

  // No fallback file either, so let Nuxt answer.
  return null
}
