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
    return
  }

  root.value = el instanceof HTMLElement ? el : null
}

/** Some of the block is inside the viewport. */
function inView(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()

  return rect.top < window.innerHeight && rect.bottom > 0
}

/** Drop the scroll watch. Called from setup so unmount always reaches it. */
function stop(): void {
  if (!import.meta.client) {
    return
  }

  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
}

/** First downward scroll that brings the block on screen starts the fade. */
function onScroll(): void {
  const el = root.value
  const y = window.scrollY

  if (y > lastScrollY) {
    scrolledDown = true
  }

  lastScrollY = y

  if (!el || !scrolledDown || shown.value || !inView(el)) {
    return
  }

  shown.value = true
  stop()
}

/** A taller window can cover the block without a scroll. Show it in place. */
function onResize(): void {
  const el = root.value

  if (!el || shown.value || !inView(el)) {
    return
  }

  waiting.value = false
  stop()
}

onMounted(() => {
  const el = root.value

  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  /** Already on screen. Leaving it visible avoids a flash to nothing. */
  if (el.getBoundingClientRect().top < window.innerHeight) {
    return
  }

  lastScrollY = window.scrollY
  waiting.value = true
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
})

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
