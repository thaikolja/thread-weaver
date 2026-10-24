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

/** Nuxt config for the one-page thread splitter. */
export default defineNuxtConfig({
  /** Lint, UI (Tailwind, icons, fonts), SEO, and images. */
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/test-utils/module',
    '@nuxt/scripts',
    '@nuxt/hints',
    '@nuxt/a11y',
    '@nuxtjs/i18n',
    '@vueuse/nuxt/module',
    'nuxt-authorization',
    'nuxt-auth-utils',
    'nuxt-qrcode'
  ],

  i18n: {
    /** Same origin as `site.url`. A different base URL would replace the canonical host. */
    baseUrl:       'https://weaver.yanawa.io',
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
      }
    ],
    /**
     * Root stays on the default locale.
     * An Accept-Language redirect would send people to /en, which repeats this page.
     */
    detectBrowserLanguage: false
  },

  /** The in-app devtools panel stays off. */
  devtools: {
    enabled: false
  },

  /** `~/` keeps Vite on app/assets. A root path made the Tailwind imports 404. */
  css: [ '~/assets/css/main.css' ],

  /** Open Graph only. Unhead warns on every twitter:* tag. */
  seo: {
    automaticTwitterTags: false,
    meta:                 {
      author:     'Kolja Nolte',
      themeColor: '#f4f5f7'
    }
  },

  /**
   * Public site name and the search description.
   * The page title already starts with Thread Weaver, so it is not appended again.
   */
  site: {
    url:           'https://weaver.yanawa.io',
    name:          'Thread Weaver',
    description:   'Paste a long post. Thread Weaver splits it into posts for X, Bluesky, Threads, and Mastodon. Markers, copy, and the download run in the browser.',
    defaultLocale: 'de-DE'
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

  /**
   * Share image is `public/og-image.png`.
   * No runtime renderer, so production does not need `NUXT_APP_SECRET`.
   */
  ogImage: {
    zeroRuntime: true
  },

  /**
   * One sitemap, without an English alternate.
   * /en repeats the same page, so it is not a second language version.
   */
  sitemap: {
    autoI18n: false,
    exclude:  [ '/auth', '/auth.md', '/en', '/en.md', '/en/**' ]
  },

  /** Do not advertise /en as a translation of this page. */
  aiReady: {
    autoI18n: false
  },

  /** The template is a light page. Don't follow the OS dark setting. */
  colorMode: {
    preference: 'light',
    fallback:   'light'
  },

  /**
   * The home page is static.
   * Auth is a stub, and /en repeats the home page, so neither is indexed.
   * noindex still allows a crawl. Disallow would hide that tag.
   */
  routeRules: {
    '/':        { prerender: true },
    '/auth':    { robots: false },
    '/auth.md': { robots: false },
    '/en':      { robots: false },
    '/en.md':   { robots: false },
    '/en/**':   { robots: false }
  },

  /** Keeps Nuxt on the current behavior for this date. */
  compatibilityDate: '2026-06-30',

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

  /** Bundle the icons we use so the page does not fetch them later. */
  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true
    }
  }
})
