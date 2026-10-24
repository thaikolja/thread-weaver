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

/**
 * Tab title and icons for the one-page tool.
 * Description, canonical, and Open Graph come from the SEO module.
 */
export function usePageMeta(): void {
  /** Already names the site, so the module must not append " | Thread Weaver". */
  const title = 'Thread Weaver — split posts for X, Bluesky, Threads, and Mastodon'

  /** Keep the title as written. The module would otherwise add the site name again. */
  useHead({
    titleTemplate: '%s',
    link:          [
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '48x48' }
    ]
  })

  /**
   * Search title, and the share image as an absolute URL.
   * A relative image is expanded with the request host in dev.
   */
  useSeoMeta({
    title,
    ogImage:       'https://weaver.yanawa.io/og-image.png',
    ogImageWidth:  1200,
    ogImageHeight: 630,
    ogImageType:   'image/png',
    ogImageAlt:    'Thread Weaver. Split a long post into posts for X, Bluesky, Threads, and Mastodon.'
  })
}
