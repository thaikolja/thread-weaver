/**
 * Theme for the Thread Weaver docs.
 * Slate matches the product. The header title is the product name.
 */
export default defineAppConfig({
  /** Title shown in the documentation header. */
  header: {
    title: 'Thread Weaver'
  },

  /** Search and share text. */
  seo: {
    title: 'Thread Weaver',
    description: 'How Thread Weaver splits a long post into posts that fit X, Bluesky, Threads, and Mastodon.'
  },

  /** Repository link in the header. */
  github: {
    url: 'https://github.com/thaikolja/thread-weaver',
    branch: 'main'
  },

  /** Calm palette, close to the app canvas. */
  ui: {
    colors: {
      primary: 'neutral',
      neutral: 'slate'
    }
  }
})
