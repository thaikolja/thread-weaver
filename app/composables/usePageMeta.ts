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
  /** Active locale. The title, image alt, and alternates follow it. */
  const { t, locales } = useI18n()

  /** Path of this page in another language, such as `/de`. */
  const switchLocalePath = useSwitchLocalePath()

  /** Already names the site, so the module must not append " | Thread Weaver". */
  const title = computed(() => t('meta.title'))

  /** English, German, and Thai, plus `x-default` for the unprefixed page. */
  const alternates = computed(() => {
    /** One hreflang for each configured locale. */
    const links = locales.value.map((locale) => {
      /** Locale objects carry `code` and `language`. A bare code is only a string. */
      const code = typeof locale === 'string' ? locale : locale.code

      // The language tag goes into hreflang.
      const language = typeof locale === 'string' ? locale : locale.language || code

      // Fall back to the home path for the default locale.
      const path = switchLocalePath(code) || '/'

      // One alternate link for this locale.
      return {
        rel:      'alternate' as const,
        hreflang: language,
        href:     new URL(path, 'https://weaver.yanawa.io').href
      }
    })

    // Add an unprefixed default so search engines have a fallback.
    return [
      ...links,
      {
        rel:      'alternate' as const,
        hreflang: 'x-default',
        href:     'https://weaver.yanawa.io/'
      }
    ]
  })

  /** Keep the title as written. The module would otherwise add the site name again. */
  useHead({
    titleTemplate: '%s',
    link:          computed(() => [
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '48x48' },
      ...alternates.value
    ])
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
    ogImageAlt:    computed(() => t('meta.ogImageAlt'))
  })
}
