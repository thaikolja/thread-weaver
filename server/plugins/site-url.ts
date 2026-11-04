/**
 * i18n registers the site URL as a function. The SEO checklist reads it
 * without calling that function, then treats the source text as a URL.
 * A plain string at a higher priority keeps the production host.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('site-config:init', ({ siteConfig }) => {
    siteConfig.push({
      _context:  'thread-weaver',
      _priority: 0,
      url:       'https://weaver.yanawa.io'
    })
  })
})
