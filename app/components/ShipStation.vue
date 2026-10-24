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

<script
  setup
  lang="ts"
>
/** Shared editor. Totals and the download live on it. */

const weaver = useWeaver()
</script>

<template>
  <div class="c-ship">
    <div class="c-ship-panel">
      <div
        class="c-ship-mark"
        :class="{
          'c-mark-x': weaver.platform === 'x',
          'c-mark-bsky': weaver.platform === 'bsky',
          'c-mark-threads': weaver.platform === 'threads',
          'c-mark-masto': weaver.platform === 'masto'
        }"
      >
        <PlatformIcon
          :platform="weaver.platform"
          class="size-6"
        />
      </div>
      <div class="space-y-1.5">
        <h3 class="c-ship-title">
          {{ $t('ship.title') }}
        </h3>
        <p class="c-ship-lead">
          <i18n-t
            keypath="ship.lead"
            tag="span"
            scope="global"
            :plural="weaver.shownPosts.length"
          >
            <template #count>
              <span class="c-ship-strong">{{ weaver.shownPosts.length }}</span>
            </template>
            <template #minutes>
              <span class="c-ship-strong">{{ weaver.shownPosts.length ? weaver.readMinutes : 0 }}</span>
            </template>
          </i18n-t>
        </p>
      </div>
      <div class="c-ship-stats">
        <div class="c-ship-stat">
          <span class="c-ship-kicker">{{ $t('ship.length') }}</span>
          <span class="c-ship-mono">{{ $t('ship.chars', { count: weaver.shownPosts.length ? weaver.totalCharacterCount : 0 }) }}</span>
        </div>
        <div class="c-ship-stat">
          <span class="c-ship-kicker">{{ $t('ship.words') }}</span> <span class="c-ship-mono">{{ weaver.wordCount }}</span>
        </div>
        <div class="c-ship-stat">
          <span class="c-ship-kicker">{{ $t('ship.target') }}</span> <span class="c-ship-target">
            <PlatformIcon
              :platform="weaver.platform"
              class="size-3.5 shrink-0"
            />
            <span>{{ weaver.platformName }}</span>
          </span>
        </div>
      </div>
      <div class="c-ship-actions">
        <button
          type="button"
          class="c-ship-copy"
          @click="weaver.copyAll()"
        >
          <UIcon
            v-if="!weaver.allCopied"
            name="i-lucide-copy"
            class="size-4"
          />
          <UIcon
            v-else
            name="i-lucide-check"
            class="size-4 text-emerald-600"
          />
          <span>{{ weaver.allCopied ? $t('ship.copied') : $t('ship.copy') }}</span>
        </button>
        <button
          type="button"
          class="c-ship-download"
          @click="weaver.download()"
        >
          <UIcon
            name="i-lucide-download"
            class="size-4 text-zinc-400"
          />
          <span>{{ $t('ship.download') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-ship {
  @apply mt-14 border-t-2 border-dashed border-zinc-300 pt-14 text-zinc-100;
}

.c-ship-panel {
  @apply mx-auto max-w-4xl space-y-6 rounded-3xl border border-white/10 bg-zinc-950 p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-10;
}

.c-ship-mark {
  @apply inline-flex size-12 items-center justify-center rounded-2xl text-white;
}

.c-mark-x {
  @apply bg-white text-black;
}

.c-mark-bsky {
  @apply bg-[#0085ff];
}

.c-mark-threads {
  @apply bg-gradient-to-r from-pink-500 to-amber-500;
}

.c-mark-masto {
  @apply bg-[#6364ff];
}

.c-ship-title {
  @apply text-2xl font-extrabold tracking-tight text-white;
}

.c-ship-lead {
  @apply text-xs text-zinc-400 sm:text-sm;
}

.c-ship-strong {
  @apply font-bold text-white;
}

.c-ship-stats {
  @apply grid grid-cols-3 gap-2 border-y border-white/10 py-2 text-xs sm:gap-4;
}

.c-ship-stat {
  @apply rounded-xl border border-white/10 bg-zinc-900 p-2 sm:p-3;
}

.c-ship-kicker {
  @apply block text-[10px] font-bold tracking-wider text-zinc-400 uppercase;
}

.c-ship-mono {
  @apply font-mono text-sm font-semibold text-zinc-100;
}

.c-ship-target {
  @apply inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-zinc-100;
}

.c-ship-actions {
  @apply flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row;
}

.c-ship-copy {
  @apply btn-tactile flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-zinc-950 shadow-md transition hover:bg-zinc-200 hover:shadow-lg sm:w-auto;
}

.c-ship-download {
  @apply btn-tactile flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 sm:w-auto;
}
</style>
