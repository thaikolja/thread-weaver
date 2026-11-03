/** Vitest runs the same files as `bun test`. */
import { fileURLToPath } from 'node:url'

/** Config helper. The Nuxt app is not booted for these unit tests. */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      /** The tests keep their Bun import. This runner supplies the same two names. */
      'bun:test': fileURLToPath(new URL('./tests/support/bun-test.ts', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts']
  }
})
