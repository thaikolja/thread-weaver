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
/** Ref callback can receive a component instance when the tag is not a native node. */
import type { ComponentPublicInstance } from 'vue'

/** Section for the payload. A div for the footer. */
withDefaults(defineProps<{
  tag?: 'div' | 'section'
}>(), {
  tag: 'div'
})

/** The block that may start under the fold. */
const root = ref<HTMLElement | null>(null)

/** Armed after mount when the block is still below the viewport. */
const waiting = ref(false)

/** Stays on so a later scroll does not replay the fade. */
const shown = ref(false)

/** Scroll position when the block was armed. */
let lastScrollY = 0

/** True after the page has moved downward. */
let scrolledDown = false

/** Native tag from `<component :is>`. A component instance is not the node. */
function setRoot(el: Element | ComponentPublicInstance | null): void {
  /** No DOM on the server. Hydration assigns the node on the client. */
  if (!import.meta.client) {
    // Nothing to store until the browser takes over.
    return
  }

  // Keep the real element, not a component instance wrapper.
  root.value = el instanceof HTMLElement ? el : null
}

/** Some of the block is inside the viewport. */
function inView(el: HTMLElement): boolean {
  // Measure where the block sits right now.
  const rect = el.getBoundingClientRect()

  // True when any part of the block is on screen.
  return rect.top < window.innerHeight && rect.bottom > 0
}

/** Drop the scroll watch. Called from setup so unmount always reaches it. */
function stop(): void {
  // Only the browser has listeners to remove.
  if (!import.meta.client) {
    // Server render never attached them.
    return
  }

  // Drop the scroll listener.
  window.removeEventListener('scroll', onScroll)

  // Drop the resize listener too.
  window.removeEventListener('resize', onResize)
}

/** First downward scroll that brings the block on screen starts the fade. */
function onScroll(): void {
  // The block may not be mounted yet.
  const el = root.value

  // Where the page is now.
  const y = window.scrollY

  // The reader is moving down the page.
  if (y > lastScrollY) {
    // Remember the direction for the reveal check.
    scrolledDown = true
  }

  // Remember this position for the next scroll event.
  lastScrollY = y

  // Keep waiting until the block enters the viewport.
  if (!el || !scrolledDown || shown.value || !inView(el)) {
    // Nothing to reveal yet.
    return
  }

  // Fade the block in.
  shown.value = true

  // No more scrolling needed.
  stop()
}

/** A taller window can cover the block without a scroll. Show it in place. */
function onResize(): void {
  // The block may not be mounted yet.
  const el = root.value

  // The resize did not bring the block on screen.
  if (!el || shown.value || !inView(el)) {
    // Keep waiting for a scroll or a larger window.
    return
  }

  // The taller window already covers it, so show it without a scroll.
  waiting.value = false

  // Nothing left to watch.
  stop()
}

// Arm the fade after mount when the block starts below the fold.
onMounted(() => {
  // The element is ready on the client now.
  const el = root.value

  // No element, or the reader asked for less motion.
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Leave the block visible without a fade.
    return
  }

  /** Already on screen. Leaving it visible avoids a flash to nothing. */
  if (el.getBoundingClientRect().top < window.innerHeight) {
    // Nothing to reveal, so keep it visible.
    return
  }

  // Remember where the page started.
  lastScrollY = window.scrollY

  // Hide the block until the reader scrolls it into view.
  waiting.value = true

  // Watch for that first downward scroll.
  window.addEventListener('scroll', onScroll, { passive: true })

  // A resize can also bring the block into view.
  window.addEventListener('resize', onResize)
})

// Always clean up the listeners.
onUnmounted(stop)
</script>

<template>
  <component
    :is="tag"
    :ref="setRoot"
    :class="{ 'c-fold-wait': waiting, 'c-fold-show': shown }"
  >
    <slot />
  </component>
</template>

<style scoped>
.c-fold-wait {
  opacity: 0;
}

.c-fold-wait.c-fold-show {
  opacity: 1;
  transition: opacity 0.65s ease;
}

@media (prefers-reduced-motion: reduce) {
  .c-fold-wait {
    opacity: 1;
  }
}
</style>
