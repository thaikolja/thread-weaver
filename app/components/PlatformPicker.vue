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
/** Button colors for the four corsets. */

import { platformButtonClass } from '~/utils/weaver/platformClass'

/** Shared editor. The page calls provideWeaver(). */

const weaver = useWeaver()
</script>

<template>
  <div class="c-platforms">
    <span class="c-kicker">{{ $t('platform.kicker') }}</span>
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="c-platform"
        :class="platformButtonClass('x', weaver.platform)"
        @click="weaver.choosePlatform('x')"
      >
        <PlatformIcon
          platform="x"
          class="size-3"
        />
        <span>{{ $t('platform.x') }}</span>
      </button>
      <button
        type="button"
        class="c-platform"
        :class="platformButtonClass('bsky', weaver.platform)"
        @click="weaver.choosePlatform('bsky')"
      >
        <PlatformIcon
          platform="bsky"
          class="size-3.5"
        />
        <span>{{ $t('platform.bsky') }}</span>
      </button>
      <button
        type="button"
        class="c-platform"
        :class="platformButtonClass('threads', weaver.platform)"
        @click="weaver.choosePlatform('threads')"
      >
        <PlatformIcon
          platform="threads"
          class="size-3.5"
        />
        <span>{{ $t('platform.threads') }}</span>
      </button>
      <button
        type="button"
        class="c-platform"
        :class="platformButtonClass('masto', weaver.platform)"
        @click="weaver.choosePlatform('masto')"
      >
        <PlatformIcon
          platform="masto"
          class="size-3.5"
        />
        <span>{{ $t('platform.masto') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-platforms {
  @apply flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center;
}

.c-kicker {
  @apply text-xs font-bold tracking-wider text-slate-600 uppercase;
}

.c-platform {
  @apply btn-tactile flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs;
}
</style>
