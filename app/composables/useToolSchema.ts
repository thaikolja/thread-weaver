/**
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
 * Structured data for the tool page.
 * WebSite, WebPage, and the author already come from the SEO module.
 */
export function useToolSchema(): void {
  /** Feature lines follow the active locale. */
  const { t } = useI18n()

  /** Free browser app. No price and no rating, so nothing invents an offer. */
  useSchemaOrg([
    defineSoftwareApp({
      '@type':               'WebApplication',
      'name':                t('nuxtSiteConfig.name'),
      'url':                 'https://weaver.yanawa.io/',
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem':     'Web',
      'softwareVersion':     '1.0.0',
      'isAccessibleForFree': true,
      'image':               '/og-image.png',
      'featureList':         [
        t('schema.featureSplit'),
        t('schema.featureMarker'),
        t('schema.featureCopy'),
        t('schema.featureDownload'),
        t('schema.featureQr')
      ]
    })
  ])
}
