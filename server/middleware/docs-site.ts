/** Serve the static Docus build at `/docs` on the same origin as the editor. */
import { createReadStream }                                                from 'node:fs'

/** The Docus `generate` output. `docs:build` writes it. */
import { join }                                                            from 'node:path'

/** Status, type, and the file stream. */
import { getRequestURL, sendStream, setResponseHeader, setResponseStatus } from 'h3'

/** Path mapping shared with the tests. */
import { docsContentType, resolveDocsAsset }                               from '../utils/docs-site'

/** Repository root is the dev and preview working directory. */
const docsRoot = join(process.cwd(), 'docs', '.output', 'public')

/** Stream the matching file from the docs build, or step aside. */
export default defineEventHandler((event) => {
  /** Prerender copies the files itself. This handler would overwrite them. */
  if (import.meta.prerender) {
    // The static build already has these files.
    return
  }

  /** `/de` and `/th` belong to the editor. */
  const asset = resolveDocsAsset(docsRoot, getRequestURL(event).pathname)

  // Not a docs URL, so let Nuxt handle the request.
  if (!asset) {
    // Nothing from the docs build matches.
    return
  }

  // Use the status the resolver chose, 200 or 404.
  setResponseStatus(event, asset.status)

  // Tell the browser what kind of file this is.
  setResponseHeader(event, 'content-type', docsContentType(asset.file))

  // Stream the file without loading it into memory.
  return sendStream(event, createReadStream(asset.file))
})
