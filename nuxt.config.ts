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
    'nuxt-auth-utils'
  ],

  i18n: {
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        file: 'en.json'
      },
      {
        code: 'de',
        file: 'de.json'
      }
    ]
  },

  /** The in-app devtools panel stays off. */
  devtools: {
    enabled: false
  },

  /** Tailwind and the small motion rules that utilities cannot express. */
  css: [ '~/assets/css/main.css' ],

  /** Public site name. The page title does not get this appended again. */
  site: {
    url:  'https://weaver.yanawa.io',
    name: 'Thread Weaver'
  },

  /** The template is a light page. Don't follow the OS dark setting. */
  colorMode: {
    preference: 'light',
    fallback:   'light'
  },

  /** The home page is static. */
  routeRules: {
    '/': { prerender: true }
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
