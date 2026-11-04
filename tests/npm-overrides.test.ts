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

/** Bun's test runner. */
import { expect, test }  from 'bun:test'

/** Read the manifest `npx` checks before it starts a package. */
import { readFileSync }  from 'node:fs'

/** package.json sits in the repo root, above this file. */
import { dirname, join } from 'node:path'

/** This file's URL, so Vitest and Bun share one root. */
import { fileURLToPath } from 'node:url'

/** Where `npx serve .output/public` is run. */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** The manifest npm loads from that directory. */
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  overrides?: Record<string, unknown>
}

/** Direct ranges. An override of one of these must repeat the same string. */
const direct = {
  ...manifest.dependencies,
  ...manifest.devDependencies
}

/** npm's arborist throws EOVERRIDE when a root override rewrites a direct range. */
test('a root override repeats the direct dependency range', () => {
  // Go through each item in turn.
  for (const [ name, spec ] of Object.entries(manifest.overrides ?? {})) {
    /** `$name` means "use the direct range", which npm allows. */
    if (typeof spec !== 'string' || spec.startsWith('$')) {
      // Skip to the next item.
      continue
    }

    // Set up raw.
    const raw = direct[name]

    /** Overrides of packages we do not depend on directly are fine. */
    if (raw === undefined) {
      // Skip to the next item.
      continue
    }

    // Make sure { name, spec } matches { name, spec: raw }.
    expect({ name, spec }).toEqual({ name, spec: raw })
  }
})

/** bun.lock copies those override strings. A stale copy brings the conflict back. */
test('bun.lock records the same override strings as package.json', () => {
  // Set up lock.
  const lock = readFileSync(join(root, 'bun.lock'), 'utf8')

  /** The overrides object is a small block near the top of the lockfile. */
  const block = lock.match(/"overrides": \{([\s\S]*?)\n {2}\},/)?.[1] ?? ''

  // Make sure block.length is greater than 0.
  expect(block.length).toBeGreaterThan(0)

  // Go through each item in turn.
  for (const [ name, spec ] of Object.entries(manifest.overrides ?? {})) {
    // Handle this case.
    if (typeof spec !== 'string') {
      // Skip to the next item.
      continue
    }

    // Make sure block contains `"${name}": "${spec}"`.
    expect(block).toContain(`"${name}": "${spec}"`)
  }
})
