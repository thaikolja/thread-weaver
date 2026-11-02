/** Header, social links, and a light canvas that matches the editor. */

export default defineAppConfig({
  docus: {
    colorMode: 'light'
  },

  seo: {
    title:       'Thread Weaver',
    description: 'Split a long post into posts that fit X, Bluesky, Threads, and Mastodon.'
  },

  header: {
    title: 'Thread Weaver',
    /** No leading slash, or Image looks for /docs/logo.svg inside public/. */
    logo:  {
      light: 'logo.svg',
      dark:  'logo.svg',
      alt:   'Thread Weaver'
    }
  },

  github: {
    url:     'https://github.com/thaikolja/thread-weaver',
    branch:  'main',
    rootDir: 'docs/content'
  },

  socials: {
    github: 'https://github.com/thaikolja/thread-weaver'
  }
})
