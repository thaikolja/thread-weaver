/** Bun's runner. Vitest loads the same file through the `bun:test` alias. */
import { expect, test } from 'bun:test'

/** A throwaway Docus-shaped tree. */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'

/** Temp directory for that tree. */
import { tmpdir } from 'node:os'

/** Paths inside the tree. */
import { join } from 'node:path'

/** The mapper the dev server uses for `/docs`. */
import { docsContentType, resolveDocsAsset } from '../server/utils/docs-site.ts'

/** Write one file and the folders above it. */
function write(root: string, relative: string, body: string) {
  /** Parent of the fixture file. */
  const file = join(root, relative)

  mkdirSync(join(file, '..'), { recursive: true })
  writeFileSync(file, body)
}

test('docs urls stay on this site and locale urls stay with the editor', () => {
  /** Fixture root, removed when the assertions finish. */
  const root = mkdtempSync(join(tmpdir(), 'weaver-docs-'))

  write(root, 'index.html', 'home')
  write(root, 'getting-started/introduction.html', 'page')
  write(root, 'getting-started/introduction/_payload.json', '{}')
  write(root, '_nuxt/app.js', 'js')
  write(root, '404.html', 'missing')

  try {
    /** `/docs` and `/docs/` are the guides home. */
    expect(resolveDocsAsset(root, '/docs')?.file.endsWith(`${join('index.html')}`)).toBe(true)
    expect(resolveDocsAsset(root, '/docs/')?.status).toBe(200)

    /** A page is the sibling `.html` file, not the payload folder. */
    const page = resolveDocsAsset(root, '/docs/getting-started/introduction')

    expect(page?.status).toBe(200)
    expect(page?.file.endsWith(join('getting-started', 'introduction.html'))).toBe(true)
    expect(resolveDocsAsset(root, '/docs/_nuxt/app.js')?.file.endsWith(join('_nuxt', 'app.js'))).toBe(true)
    expect(docsContentType(join('_nuxt', 'app.js'))).toBe('text/javascript; charset=utf-8')

    /** A missing guide uses the Docus 404. The editor keeps `/`, `/de`, and `/th`. */
    expect(resolveDocsAsset(root, '/docs/missing-page')?.status).toBe(404)
    expect(resolveDocsAsset(root, '/')).toBeNull()
    expect(resolveDocsAsset(root, '/de')).toBeNull()
    expect(resolveDocsAsset(root, '/th')).toBeNull()
    expect(resolveDocsAsset(root, '/docs/../package.json')).toBeNull()
    expect(resolveDocsAsset(root, '/docs/%2e%2e/package.json')).toBeNull()
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
