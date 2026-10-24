// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@nuxt/image'
  ],

  devtools: {
    enabled: false
  },

  css: [ '~/assets/css/main.css' ],

  site: {
    url:  'https://weaver.yanawa.io',
    name: 'Thread Weaver'
  },

  colorMode: {
    preference: 'light',
    fallback:   'light'
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle:  '1tbs'
      }
    }
  },

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

  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true
    }
  }
})
