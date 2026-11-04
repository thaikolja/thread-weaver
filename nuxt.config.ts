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

/** Read the static guides folder before deciding whether to publish it. */
import { existsSync } from 'node:fs'

/** Absolute path of that folder. */
import { resolve }    from 'node:path'

const THREAD_WEAVER_VERSION: string = '1.0.0'

/** Docus `generate` output. Missing until `docs:build` has run. */
const docsStaticDir = resolve(process.cwd(), 'docs/.output/public')

/** Nuxt config for the one-page thread splitter. */
export default defineNuxtConfig({
  /** Lint, UI (Tailwind, icons, fonts), SEO, and images. */
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/a11y',
    '@nuxtjs/i18n',
    '@vueuse/nuxt/module',
    'nuxt-qrcode'
  ],

  /** The in-app devtools panel stays off. */
  devtools: {
    enabled: false
  },

  /**
   * The editor is the site root. German is `/de`, Thai is `/th`.
   * The static guides are mounted beside those routes at `/docs`.
   */
  app: {
    baseURL: '/'
  },

  /** `~/` keeps Vite on app/assets. A root path made the Tailwind imports 404. */
  css: [ '~/assets/css/main.css' ],

  /**
   * Public site name and the search description.
   * The page title already starts with Thread Weaver, so it is not appended again.
   */
  site: {
    url:           'https://weaver.yanawa.io',
    name:          'Thread Weaver',
    description:   'Paste a long post. Thread Weaver splits it into posts for X, Bluesky, Threads, and Mastodon. Markers, copy, and the download run in the browser.',
    defaultLocale: 'en-US'
  },

  /** The template is a light page. Don't follow the OS dark setting. */
  colorMode: {
    preference: 'light',
    fallback:   'light'
  },

  runtimeConfig: {
    public: {
      version: THREAD_WEAVER_VERSION ?? '1.0.0'
    }
  },

  /** The home page is static. `/docs` is the copied Docus build, not a Vue route. */
  routeRules: {
    '/':        { prerender: true },
    '/docs':    { prerender: false },
    '/docs/**': { prerender: false }
  },

  /** Pin the host. An unset host is saved as `{}` and the next dev start crashes. */
  devServer: {
    host: 'localhost'
  },

  /** Keeps Nuxt on the current behavior for this date. */
  compatibilityDate: '2026-06-30',

  /**
   * Copy the static guides into the generated site at `/docs`.
   * The dev server also streams that folder, so one origin serves both.
   */
  nitro: {
    publicAssets: existsSync(docsStaticDir)
                    ? [ {
        baseURL: '/docs',
        dir:     docsStaticDir,
        maxAge:  60 * 60 * 24 * 7,
        /** A missing clean URL must reach the docs middleware, not a placeholder 404. */
        fallthrough: true
      } ]
                    : [],
    prerender:    {
      ignore: [ '/docs', '/docs/**' ]
    }
  },

  /** Advertise `/de` and `/th` as translations of this page. */
  aiReady: {
    autoI18n: true
  },

  /** Match the style already used in this repo. */
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle:  '1tbs'
      }
    }
  },

  /** Plus Jakarta for the UI, JetBrains Mono for the counts. */
  fonts: {
    families: [
      {
        name:     'Plus Jakarta Sans',
        provider: 'google',
        weights:  [ '400', '500', '600', '700', '800' ],
        global:   true
      },
      {
        name:     'JetBrains Mono',
        provider: 'google',
        weights:  [ '400', '500', '600' ],
        global:   true
      }
    ]
  },

  i18n: {
    /** Same origin as `site.url`. A different base URL would replace the canonical host. */
    baseUrl: 'https://weaver.yanawa.io',
    /** Default locale keeps the bare path. `prefix` would put English on `/en`. */
    strategy:      'prefix_except_default',
    defaultLocale: 'en',
    locales:       [
      {
        code:     'en',
        name:     'English',
        language: 'en-US',
        file:     'en-US.json'
      },
      {
        code:     'de',
        name:     'Deutsch',
        language: 'de-DE',
        file:     'de-DE.json'
      },
      {
        code:     'th',
        name:     'ภาษาไทย',
        language: 'th-TH',
        file:     'th-TH.json'
      }
    ],
    /**
     * English stays on `/`. German is `/de` and Thai is `/th`.
     * The browser language does not redirect.
     */
    detectBrowserLanguage: false
  },

  /** Bundle the icons we use so the page does not fetch them later. */
  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true
    }
  },

  /**
   * Share image is `public/og-image.png`.
   * No runtime renderer, so production does not need `NUXT_APP_SECRET`.
   */
  ogImage: {
    zeroRuntime: true
  },

  qrcode: {
    options: {
      variant:    'rounded',
      radius:     1,
      blackColor: '#000000',
      whiteColor: '#ffffff'
    }
  },

  /** The author. WebSite.publisher points here. */
  schemaOrg: {
    identity: {
      type:   'Person',
      name:   'Kolja Nolte',
      url:    'https://www.kolja-nolte.com',
      sameAs: [
        'https://github.com/thaikolja',
        'https://github.com/thaikolja/thread-weaver'
      ]
    }
  },

  /** Open Graph only. Unhead warns on every twitter:* tag. */
  seo: {
    automaticTwitterTags: false,
    meta:                 {
      author:     'Kolja Nolte',
      themeColor: '#f4f5f7'
    }
  },

  /** English, German, and Thai each get a sitemap entry. */
  sitemap: {
    autoI18n: true
  }
})
