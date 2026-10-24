/** Resolve the repository docs folder, which is the static site output. */
import { fileURLToPath } from 'node:url'

/**
 * Docus documentation site for Thread Weaver.
 * `nuxt generate` writes the static files into the repository `/docs` folder.
 */
export default defineNuxtConfig({
  /** Use the Docus layer: Nuxt Content, Nuxt UI, and the docs theme. */
  extends: ['docus'],

  /** Keep Nuxt on the same compatibility date as the app. */
  compatibilityDate: '2026-06-30',

  /** Name and canonical URL used by SEO tags. */
  site: {
    name: 'Thread Weaver',
    url: 'https://weaver.yanawa.io',
    description: 'Documentation for Thread Weaver, the browser tool that splits long posts for X, Bluesky, Threads, and Mastodon.'
  },

  /** Favicon shared with the app. */
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }
      ]
    }
  },

  /** Static HTML, CSS, and JS land in /docs, one level above this project. */
  nitro: {
    output: {
      publicDir: fileURLToPath(new URL('../docs', import.meta.url))
    }
  },

})
