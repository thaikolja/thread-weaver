/**
 * Tab title and social tags for the one-page tool.
 * The title template is just the string itself, so the site name is not appended twice.
 */
export function usePageMeta(): void {
  /** Browser title, icon, and language. */
  const title = 'Thread Weaver — Attention Span Reducer'

  /** Same sentence as the masthead. */
  const description = 'Because nobody on the timeline reads more than three sentences without suffering dopamine withdrawal.'

  /** Keep the title as written. Nuxt SEO would otherwise add " | Thread Weaver". */
  useHead({
    titleTemplate: '%s',
    meta:          [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link:          [
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '48x48' }
    ],
    htmlAttrs:     {
      lang: 'en'
    }
  })

  /** Search and share cards use the same title and description. */
  useSeoMeta({
    title,
    description,
    ogTitle:       title,
    ogDescription: description
  })
}
