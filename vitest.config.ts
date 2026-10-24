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

import { fileURLToPath }       from 'node:url'
import { defineConfig }        from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name:        'unit',
          include:     [ 'test/unit/*.{test,spec}.ts' ],
          environment: 'node'
        }
      },
      await defineVitestProject({
        test: {
          name:               'nuxt',
          include:            [ 'test/nuxt/*.{test,spec}.ts' ],
          environment:        'nuxt',
          environmentOptions: {
            nuxt: {
              rootDir:        fileURLToPath(new URL('.', import.meta.url)),
              domEnvironment: 'happy-dom'
            }
          }
        }
      })
    ],
    coverage: {
      enabled:  true,
      provider: 'v8'
    }
  }
})
