/*
 * Thread Weaver
 *
 * @description     Online tool to split long messages into parts for character-limited platforms
 * @author          Kolja Nolte <kolja.nolte@gmail.com>
 * @copyright       2026 (C) Kolja Nolte
 * @see             https://www.kolja-nolte.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * @package Thread Weaver
 */

/** Bun's runner. Vitest loads the same file through the `bun:test` alias. */
import { expect, test }                                  from 'bun:test'

/** A throwaway Docus-shaped tree. */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'

/** Temp directory for that tree. */
import { tmpdir }                                        from 'node:os'

/** Paths inside the tree. */
import { join }                                          from 'node:path'

/** The mapper the dev server uses for `/docs`. */
import { docsContentType, resolveDocsAsset }             from '../server/utils/docs-site.ts'

/** Write one file and the folders above it. */
function write(root: string, relative: string, body: string) {
  /** Parent of the fixture file. */
  const file = join(root, relative)

  // Create the folders above the fixture file.
  mkdirSync(join(file, '..'), { recursive: true })

  // Write the small file the test will read back.
  writeFileSync(file, body)
}

/** Docs URLs resolve inside the build, while locale URLs stay with the editor. */
test('docs urls stay on this site and locale urls stay with the editor', () => {
  /** Fixture root, removed when the assertions finish. */
  const root = mkdtempSync(join(tmpdir(), 'weaver-docs-'))

  // Run this step.
  write(root, 'index.html', 'home')

  // Run this step.
  write(root, 'getting-started/introduction.html', 'page')

  // Run this step.
  write(root, 'getting-started/introduction/_payload.json', '{}')

  // Run this step.
  write(root, '_nuxt/app.js', 'js')

  // Run this step.
  write(root, '404.html', 'missing')

  // Run the assertions and clean up afterwards.
  try {
    /** `/docs` and `/docs/` are the guides home. */
    expect(resolveDocsAsset(root, '/docs')?.file.endsWith(`${join('index.html')}`)).toBe(true)

    // Make sure resolveDocsAsset(root, '/docs/')?.status is 200.
    expect(resolveDocsAsset(root, '/docs/')?.status).toBe(200)

    /** A page is the sibling `.html` file, not the payload folder. */
    const page = resolveDocsAsset(root, '/docs/getting-started/introduction')

    // Make sure page?.status is 200.
    expect(page?.status).toBe(200)

    // Make sure page?.file.endsWith(join('getting-started', … is true.
    expect(page?.file.endsWith(join('getting-started', 'introduction.html'))).toBe(true)

    // Make sure resolveDocsAsset(root, '/docs/_nuxt/app.js')… is true.
    expect(resolveDocsAsset(root, '/docs/_nuxt/app.js')?.file.endsWith(join('_nuxt', 'app.js'))).toBe(true)

    // Make sure docsContentType(join('_nuxt', 'app.js')) is 'text/javascript; charset=utf-8'.
    expect(docsContentType(join('_nuxt', 'app.js'))).toBe('text/javascript; charset=utf-8')

    /** A missing guide uses the Docus 404. The editor keeps `/`, `/de`, and `/th`. */
    expect(resolveDocsAsset(root, '/docs/missing-page')?.status).toBe(404)

    // Make sure resolveDocsAsset(root, '/') is null.
    expect(resolveDocsAsset(root, '/')).toBeNull()

    // Make sure resolveDocsAsset(root, '/de') is null.
    expect(resolveDocsAsset(root, '/de')).toBeNull()

    // Make sure resolveDocsAsset(root, '/th') is null.
    expect(resolveDocsAsset(root, '/th')).toBeNull()

    // Make sure resolveDocsAsset(root, '/docs/../package.jso… is null.
    expect(resolveDocsAsset(root, '/docs/../package.json')).toBeNull()

    // Make sure resolveDocsAsset(root, '/docs/%2e%2e/package… is null.
    expect(resolveDocsAsset(root, '/docs/%2e%2e/package.json')).toBeNull()
  } finally {
    // Run this step.
    rmSync(root, { recursive: true, force: true })
  }
})
