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

/** Vitest runs the same files as `bun test`. */
import { fileURLToPath } from 'node:url'

/** Config helper. The Nuxt app is not booted for these unit tests. */
import { defineConfig }  from 'vitest/config'

/** Vitest config for the unit tests, with the Bun import alias. */
export default defineConfig({
  resolve: {
    alias: {
      /** The tests keep their Bun import. This runner supplies the same two names. */
      // @ts-ignore
      'bun:test': fileURLToPath(new URL('./tests/support/bun-test.ts', import.meta.url))
    }
  },
  test:    {
    environment: 'node',
    include:     [ 'tests/**/*.test.ts' ]
  }
})
