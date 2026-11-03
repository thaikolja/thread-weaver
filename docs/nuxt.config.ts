/** Docus app. The public site serves these pages at /docs. */

export default defineNuxtConfig({
  /** Canonical host. baseURL adds the /docs prefix. */
  site: {
    url:  'https://weaver.yanawa.io',
    name: 'Thread Weaver'
  },

  app: {
    baseURL: '/docs/'
  },

  /** A base URL cannot ship its own robots.txt. The editor site owns that file. */
  robots: {
    robotsTxt: false
  },

  /** Bundle Phosphor so the landing icons do not fetch later. */
  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true
    }
  }
})
