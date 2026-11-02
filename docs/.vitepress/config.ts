import { defineConfig } from 'vitepress'

/** Project Pages site: https://thaikolja.github.io/thread-weaver/ */
const base = '/thread-weaver/'

export default defineConfig({
  title: 'Thread Weaver',
  description: 'Split a long post into posts that fit X, Bluesky, Threads, and Mastodon.',
  base,
  lang: 'en-US',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Thread Weaver',
    nav: [
      { text: 'Getting started', link: '/getting-started/introduction' },
      { text: 'Using the tool', link: '/using-the-tool/workbench' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'Reference', link: '/reference/types-and-limits' }
    ],
    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Introduction', link: '/getting-started/introduction' },
          { text: 'Installation', link: '/getting-started/installation' }
        ]
      },
      {
        text: 'Using the tool',
        items: [
          { text: 'The workbench', link: '/using-the-tool/workbench' },
          { text: 'Platforms', link: '/using-the-tool/platforms' },
          { text: 'Markers and bridges', link: '/using-the-tool/markers-and-bridges' },
          { text: 'Text tools', link: '/using-the-tool/text-tools' },
          { text: 'Shipping', link: '/using-the-tool/shipping' }
        ]
      },
      {
        text: 'Architecture',
        items: [
          { text: 'Overview', link: '/architecture/overview' },
          { text: 'Page and state', link: '/architecture/page-and-state' },
          { text: 'Splitting', link: '/architecture/splitting' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Types and limits', link: '/reference/types-and-limits' },
          { text: 'Splitting and compile', link: '/reference/splitting-and-compile' },
          { text: 'State and metrics', link: '/reference/state-and-metrics' },
          { text: 'Composables', link: '/reference/composables' },
          { text: 'Components', link: '/reference/components' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/thaikolja/thread-weaver' }
    ],
    search: {
      provider: 'local'
    },
    outline: [2, 3],
    footer: {
      message: 'MIT License'
    }
  }
})
