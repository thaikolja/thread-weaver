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

/** Upload a static preview. The Docus build is mounted at /docs first. */
import { spawnSync }     from 'node:child_process'
import { existsSync }    from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repository root, one level above this script. */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Run one command from the repo root and stop when it fails. */
function run(command, args) {
  /** Status from the child. A spawn error has no status. */
  const result = spawnSync(command, args, {
    cwd:   root,
    stdio: 'inherit',
    env:   process.env
  })

  if (result.error) {
    console.error(result.error.message)
    process.exit(1)
  }

  if (result.status!==0) {
    process.exit(result.status ?? 1)
  }
}

/** Editor plus the Docus pages at `/docs`. */
run('bun', [ 'run', 'build:site' ])

/** Home page of the static build Wrangler is about to upload. */
const home = join(root, '.output', 'public', 'index.html')

if (!existsSync(home)) {
  console.error('Static build is missing .output/public/index.html')
  process.exit(1)
}

/** Assets-only Worker. The public host is thread-weaver.kolja.codes. */
run('bun', [ 'x', 'wrangler', 'deploy', '--no-autoconfig' ])
