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
/** Shared editor. The list just reads the compiled posts. */

const weaver = useWeaver()

/** Dip when a control changes the cards. Typing in the source does not. */
const { dimmed, pulse } = useDisplayFade()

/** Which way each chunk should step while the list slides. */
const nudges = ref<Record<string, 'up' | 'down'>>({})

/** Clears the step once the slide has finished. */
let nudgeTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => [
    weaver.platform,
    weaver.marker,
    weaver.placement,
    weaver.bridge,
    weaver.capitalize,
    weaver.finishSentences,
    weaver.keepBreaks
  ],
  () => {
    pulse()
  }
)

watch(
  () => weaver.shownPosts.map(post => post.id),
  (next, prev) => {
    /** A move swaps two neighbors. A repack or a drop does not. */
    const swapped = prev.length === next.length && prev.filter((id, index) => id !== next[index]).length === 2

    if (!swapped) {
      return
    }

    if (import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    /** Direction comes from the index change, not from which button was clicked. */
    const nextNudges: Record<string, 'up' | 'down'> = {}

    for (const id of next) {
      const before = prev.indexOf(id)
      const after = next.indexOf(id)

      if (before !== after) {
        nextNudges[id] = after < before ? 'up' : 'down'
      }
    }

    nudges.value = nextNudges

    clearTimeout(nudgeTimer)

    nudgeTimer = setTimeout(() => {
      nudges.value = {}
    }, 520)
  }
)

/** The slot paints above its neighbor while it slides up. */
function slotClass(id: string): string {
  if (nudges.value[id] === 'up') {
    return 'c-chunk-up'
  }

  if (nudges.value[id] === 'down') {
    return 'c-chunk-down'
  }

  return ''
}

/** Side step so the two chunks pass instead of stacking flat. */
function nudgeClass(id: string): string {
  if (nudges.value[id] === 'up') {
    return 'c-chunk-nudge-up'
  }

  if (nudges.value[id] === 'down') {
    return 'c-chunk-nudge-down'
  }

  return ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="c-list-head">
      <div class="flex items-center gap-3">
        <div class="c-list-count">
          {{ weaver.shownPosts.length }}
        </div>
        <div class="flex h-9 flex-col justify-center">
          <h2 class="c-list-title">
            {{ $t('list.title') }}
          </h2>
          <p class="c-list-meta">
            {{ $t('list.meta', { count: weaver.shownPosts.length }) }}
          </p>
        </div>
      </div>
      <button
        type="button"
        class="c-list-copy"
        @click="weaver.copyAll()"
      >
        <UIcon
          name="i-ph-copy"
          class="size-3.5"
        />
        <span>{{ weaver.allCopied ? $t('list.copied') : $t('list.copy') }}</span>
      </button>
    </div>

    <div
      v-if="weaver.shownPosts.length"
      class="relative transition-opacity duration-200 ease-out motion-reduce:transition-none motion-reduce:opacity-100"
      :class="{ 'opacity-50': dimmed }"
    >
      <div class="c-list-spine" />
      <TransitionGroup
        name="thread-chain"
        tag="div"
        class="relative space-y-4 sm:space-y-6"
      >
        <div
          v-for="(post, index) in weaver.shownPosts"
          :key="post.id"
          class="c-chunk-slot"
          :class="slotClass(post.id)"
        >
          <PostCard
            :post="post"
            :index="index"
            :class="nudgeClass(post.id)"
          />
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-list-head {
  @apply flex min-h-[44px] flex-wrap items-center justify-between gap-3 px-1;
}

.c-list-count {
  @apply flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white tabular-nums shadow-sm;
}

.c-list-title {
  @apply mb-1 text-base leading-none font-bold text-slate-900;
}

.c-list-meta {
  @apply text-xs leading-none text-slate-600 tabular-nums;
}

.c-list-copy {
  @apply btn-tactile ml-auto flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800;
}

.c-list-spine {
  @apply absolute top-8 bottom-8 left-6 -z-0 hidden w-0.5 bg-slate-200 sm:block;
}

.c-chunk-slot {
  @apply relative;
}

.c-chunk-up {
  z-index: 2;
}

.c-chunk-down {
  z-index: 1;
}
</style>
