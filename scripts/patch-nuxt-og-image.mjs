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

/**
 * Bun 1.x does not provide Node's `module.findPackageJSON` yet.
 * nuxt-og-image calls it while the module is being set up, which makes
 * `nuxt prepare` fail before the app can build. Add a tiny fallback to the
 * installed copy so `bun install` works on Bun as well as Node.
 */

/** File system helpers for the fallback lookup. */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

/** Walk up from the import location until a package manifest is found. */
import { join } from 'node:path'

/** The installed og-image package, relative to this repository. */
const packageDir = join(process.cwd(), 'node_modules', 'nuxt-og-image', 'dist')

/** The fallback that matches the one call nuxt-og-image makes. */
const fallback = `import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
function findPackageJSON(_specifier, base) {
  let dir = base && base.startsWith('file:') ? fileURLToPath(base) : (base || process.cwd());
  if (!existsSync(dir) || !statSync(dir).isDirectory()) dir = dirname(dir);
  for (;;) {
    const candidate = join(dir, 'package.json');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}`

/** The import that Bun cannot provide. */
const importLine = 'import { findPackageJSON } from \'node:module\';'

/** Replace the missing export with the local fallback. */
function patchFile(file) {
  /** Read the generated module. */
  const source = readFileSync(file, 'utf8')

  /** Already patched, so leave it alone. */
  if (!source.includes(importLine)) {
    return false
  }

  // Drop the unavailable import and put the fallback in its place.
  const next = source.replace(importLine, fallback)

  // Write only when something really changed.
  if (next === source) {
    return false
  }

  writeFileSync(file, next)

  return true
}

/** Walk the package output and patch every affected module. */
function walk(dir) {
  // Skip a missing package, which happens before the dependency is installed.
  if (!existsSync(dir)) {
    return
  }

  // Visit every entry in this folder.
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    // Build the full path once.
    const full = join(dir, entry.name)

    if (entry.isDirectory()) {
      // Look inside nested output folders.
      walk(full)
    } else if (entry.name.endsWith('.mjs')) {
      // Patch the generated modules that still import the missing export.
      patchFile(full)
    }
  }
}

// Apply the fix after install, before `nuxt prepare` runs.
walk(packageDir)
