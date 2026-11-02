<!--
  - Thread Weaver
  -
  - @description     Online tool to split long messages into parts for character-limited platforms
  - @author          Kolja Nolte <kolja.nolte@gmail.com>
  - @copyright       2026 (C) Kolja Nolte
  - @see             https://www.kolja-nolte.com
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - @package Thread Weaver
  -->

<script setup lang="ts">
/** Phosphor mark for one corset. Bluesky uses the butterfly. */

import type { PlatformId } from '~/utils/weaver/types'

const props = defineProps<{
  platform: PlatformId
}>()

/** Filled Phosphor names. The parent passes the size. */
const names: Record<PlatformId, string> = {
  x: 'i-ph-x-logo-fill',
  bsky: 'i-ph-butterfly-fill',
  threads: 'i-ph-threads-logo-fill',
  masto: 'i-ph-mastodon-logo-fill'
}
</script>

<template>
  <UIcon
    :name="names[props.platform]"
    aria-hidden="true"
  />
</template>
