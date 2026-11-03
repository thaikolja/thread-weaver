/** Bun's test runner. Vitest loads the same file through the `bun:test` alias. */
import { expect, test } from 'bun:test'

/** Read the files that name this release. */
import { readFileSync } from 'node:fs'

/** package.json and CHANGELOG.md sit in the repo root. */
import { dirname, join } from 'node:path'

/** This file's URL, so Vitest and Bun share one root. */
import { fileURLToPath } from 'node:url'

/** Repo root, one level above tests/. */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** The version field the package and the site publish. */
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  version?: string
}

/** First release heading in the changelog, such as `v1.0.0`. */
const heading = readFileSync(join(root, 'CHANGELOG.md'), 'utf8').match(/^## (v\d+\.\d+\.\d+)/m)?.[1]

/** The string `runtimeConfig.public.version` is built from. */
const runtime = readFileSync(join(root, 'nuxt.config.ts'), 'utf8').match(/const THREAD_WEAVER_VERSION: string = '([^']+)'/)?.[1]

test('the shipped version and the changelog heading are 1.0.0', () => {
  /** A leftover 1.1.0 label fails this before the equality checks. */
  expect(manifest.version).not.toBe('1.1.0')
  expect(heading).not.toBe('v1.1.0')
  expect(manifest.version).toBe('1.0.0')

  /** The heading has to name the same release as package.json. */
  expect(heading).toBe(`v${manifest.version}`)

  /** The public runtime version is that same string. */
  expect(runtime).toBe(manifest.version)
})
