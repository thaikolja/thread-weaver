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

/** Build the static Docus site once, so `/docs` exists before the editor starts. */
import { spawnSync }     from 'node:child_process'
import { existsSync }    from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repository root, one level above this script. */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Home page of the static guides. */
const home = join(root, 'docs', '.output', 'public', 'index.html')

if (existsSync(home)) {
  process.exit(0)
}

/** Same command as `bun run docs:build`. */
const result = spawnSync('bun', [ 'run', 'docs:build' ], {
  cwd:   root,
  stdio: 'inherit',
  env:   process.env
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
