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

/** Throwaway module the helper is imported from. */
import { mkdtempSync, rmSync, writeFileSync }            from 'node:fs'

/** Temp directory for that module. */
import { tmpdir }                                        from 'node:os'

/** Paths inside the tree. */
import { join }                                          from 'node:path'

/** The rewriter `postinstall` runs before `nuxt prepare`. */
import { HELPER_MARKER, patchSource }                    from '../scripts/patch-nuxt-og-image.mjs'

/** A generated module that only needs the missing named export. */
const solo = `import { findPackageJSON } from 'node:module';
import { join } from 'node:path';
export const locate = (spec, base) => findPackageJSON(spec, base);
`

/** nuxtseo-shared/devtools shape. */
const mixed = `import { createRequire, findPackageJSON } from 'node:module';
import { join } from 'node:path';
export { createRequire };
export const locate = (spec, base) => findPackageJSON(spec, base);
`

/** The first patcher put the helper between import statements. */
const legacy = `import * as fs from 'node:fs';
import { existsSync as __findExistsSync, statSync as __findStatSync } from 'node:fs';
import { dirname as __findDirname, join as __findJoin } from 'node:path';
import { fileURLToPath as __findFileURLToPath } from 'node:url';
function findPackageJSON(_specifier, base) {
  let dir = base && base.startsWith('file:') ? __findFileURLToPath(base) : (base || process.cwd());
  if (!__findExistsSync(dir) || !__findStatSync(dir).isDirectory()) dir = __findDirname(dir);
  for (;;) {
    const candidate = __findJoin(dir, 'package.json');
    if (__findExistsSync(candidate)) return candidate;
    const parent = __findDirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}
import { join } from 'node:path';
export const locate = (spec, base) => findPackageJSON(spec, base);
`

test('drops a solo findPackageJSON import and keeps later imports above the helper', () => {
  // Rewrite the generated module.
  const { next, changed } = patchSource(solo)

  // Make sure changed is true.
  expect(changed).toBe(true)

  // Make sure the named import is gone.
  expect(next).not.toMatch(/import\s*\{[^}]*\bfindPackageJSON\b[^}]*\}\s*from\s*['"]node:module['"]/)

  // Make sure the helper sits below every import.
  expect(next.indexOf(HELPER_MARKER)).toBeGreaterThan(next.lastIndexOf('import '))

  // Make sure join stays an import.
  expect(next).toContain('import { join } from \'node:path\';')
})

test('keeps createRequire when it shares the node:module import', () => {
  // Rewrite the mixed import.
  const { next } = patchSource(mixed)

  // Make sure createRequire is still imported from node:module.
  expect(next).toContain('import { createRequire } from \'node:module\';')

  // Make sure findPackageJSON is not on that import.
  expect(next).not.toMatch(/import\s*\{[^}]*\bfindPackageJSON\b[^}]*\}\s*from\s*['"]node:module['"]/)
})

test('moves a helper that was inserted between import statements', () => {
  // Rewrite the legacy patched module.
  const { next, changed } = patchSource(legacy)

  // Make sure changed is true.
  expect(changed).toBe(true)

  // Make sure no import follows the helper.
  expect(next).not.toMatch(/function findPackageJSON[\s\S]*\nimport\s/)

  // A second pass must leave the file alone.
  expect(patchSource(next).changed).toBe(false)
})

test('the helper finds this package and a bare specifier', async () => {
  /** Throwaway folder for the rewritten module. */
  const dir = mkdtempSync(join(tmpdir(), 'tw-find-pkg-'))

  try {
    /** Patched source that re-exports the helper. */
    const { next } = patchSource(solo)

    // Write the module next to a real package.json via the repo root import.
    writeFileSync(join(dir, 'locate.mjs'), next)

    /** The rewritten helper, loaded the way Bun loads nuxt-og-image. */
    const { locate } = await import(join(dir, 'locate.mjs'))

    /** Manifest of this repository. */
    const self = locate('./', import.meta.url)

    // Make sure self ends with package.json.
    expect(self).toMatch(/package\.json$/)

    /** Installed nuxt-og-image, the same bare lookup the SEO kit makes. */
    const ogImage = locate('nuxt-og-image', join(import.meta.dir, '..', 'package.json'))

    // Make sure ogImage points at that package.
    expect(ogImage).toMatch(/nuxt-og-image[/\\]package\.json$/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
