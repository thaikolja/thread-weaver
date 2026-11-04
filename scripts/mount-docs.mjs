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

/** Copy the Docus build into the site output so /docs is part of the website. */
import { cpSync, existsSync } from 'node:fs'
import { dirname, join }      from 'node:path'
import { fileURLToPath }      from 'node:url'

/** Repository root, one level above this script. */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Static Docus output. */
const built = join(root, 'docs', '.output', 'public')

/** Nuxt generate output for the editor. */
const site = join(root, '.output', 'public')

if (!existsSync(join(site, 'index.html'))) {
  console.error('Site build is missing .output/public/index.html')
  process.exit(1)
}

/** Some baseURL builds nest a docs/ folder. This Docus app writes a flat public tree. */
const nestedHome = join(built, 'docs', 'index.html')
const flatHome   = join(built, 'index.html')

if (existsSync(nestedHome)) {
  cpSync(join(built, 'docs'), join(site, 'docs'), { recursive: true })
} else if (existsSync(flatHome)) {
  cpSync(built, join(site, 'docs'), { recursive: true })
} else {
  console.error('Docus build is missing docs/.output/public')
  process.exit(1)
}

/** Asset folders that Nuxt may leave beside the nested docs directory. */
for (const folder of [ '_nuxt', '_og' ]) {
  /** Present only for some baseURL layouts. */
  const source = join(built, folder)

  if (existsSync(source)) {
    cpSync(source, join(site, 'docs', folder), { recursive: true })
  }
}
