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

// Check whether the app is running in development.
import { defineNuxtPlugin, useuseEnvironment } from '#imports'

// The analytics plugin itself.
import SimpleAnalytics from 'simple-analytics-vue'

// The current environment flag.
const environment = useuseEnvironment()

// Leave a trace while wiring the plugin.
console.log(environment)

// Register analytics on the client only.
export default defineNuxtPlugin((nuxtApp) => {
  // Analytics stays off outside production.
  nuxtApp.vueApp.use(SimpleAnalytics, {
    skip: environment
  })
})
