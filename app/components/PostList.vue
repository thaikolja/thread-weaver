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

// Repack or marker changes dip the list briefly.
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
    // Dip the list for a moment.
    pulse()
  }
)

// A straight swap means a move, so the cards slide past each other.
watch(
  () => weaver.shownPosts.map(post => post.id),
  (next, prev) => {
    /** A move swaps two neighbors. A repack or a drop does not. */
    const swapped = prev.length === next.length && prev.filter((id, index) => id !== next[index]).length === 2

    // A repack or a drop should not slide anything.
    if (!swapped) {
      // Only straight swaps get the move animation.
      return
    }

    // Skip the slide when motion is reduced.
    if (import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Leave the cards in place.
      return
    }

    /** Direction comes from the index change, not from which button was clicked. */
    const nextNudges: Record<string, 'up' | 'down'> = {}

    // Compare the old and new positions of every card.
    for (const id of next) {
      // Where this card used to sit.
      const before = prev.indexOf(id)

      // Where it sits now.
      const after = next.indexOf(id)

      // A smaller index means it moved up.
      if (before !== after) {
        // Store the direction for this card.
        nextNudges[id] = after < before ? 'up' : 'down'
      }
    }

    // Apply the direction flags for the slide.
    nudges.value = nextNudges

    // A new move replaces the old cleanup timer.
    clearTimeout(nudgeTimer)

    // Clear the flags once the slide is over.
    nudgeTimer = setTimeout(() => {
      // Forget the directions once the animation is done.
      nudges.value = {}
    }, 520)
  }
)

/** The slot paints above its neighbor while it slides up. */
function slotClass(id: string): string {
  // An upward move needs the higher stacking order.
  if (nudges.value[id] === 'up') {
    // Paint this slot above its neighbor.
    return 'c-chunk-up'
  }

  // A downward move stays below its neighbor.
  if (nudges.value[id] === 'down') {
    // Keep this slot underneath.
    return 'c-chunk-down'
  }

  // No move, so no special stacking class.
  return ''
}

/** Side step so the two chunks pass instead of stacking flat. */
function nudgeClass(id: string): string {
  // Step right while sliding up.
  if (nudges.value[id] === 'up') {
    // Push the card to the side so the two pass.
    return 'c-chunk-nudge-up'
  }

  // Step left while sliding down.
  if (nudges.value[id] === 'down') {
    // Push the card the other way.
    return 'c-chunk-nudge-down'
  }

  // No move, so no side step either.
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
