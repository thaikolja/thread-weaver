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

/** The analytics plugin. It warns when loaded with skip turned on. */
import SimpleAnalytics from 'simple-analytics-vue'

/** Count production visits. Development does not load the script. */
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.dev) {
    return
  }

  nuxtApp.vueApp.use(SimpleAnalytics, {
    skip: false
  })
})
