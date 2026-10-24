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
/** Which card this is, so the first and last arrows can disable themselves. */

defineProps<{
  index: number
  total: number
}>()

/** Shared editor. Move does not repack the text. */

const weaver = useWeaver()
</script>

<template>
  <div class="c-moves">
    <button
      type="button"
      title="Move Up"
      aria-label="Move Up"
      class="c-move"
      :class="index === 0 ? 'c-move-off' : 'c-move-on'"
      :disabled="index === 0"
      @click="weaver.move(index, -1)"
    >
      <UIcon
        name="i-lucide-chevron-up"
        class="size-3.5"
      />
    </button>
    <button
      type="button"
      title="Move Down"
      aria-label="Move Down"
      class="c-move"
      :class="index === total - 1 ? 'c-move-off' : 'c-move-on'"
      :disabled="index === total - 1"
      @click="weaver.move(index, 1)"
    >
      <UIcon
        name="i-lucide-chevron-down"
        class="size-3.5"
      />
    </button>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-moves {
  @apply flex items-center rounded-lg border border-slate-200/60 bg-slate-100 p-0.5;
}

.c-move {
  @apply btn-tactile rounded-md p-1 transition;
}

.c-move-off {
  @apply cursor-not-allowed opacity-30;
}

.c-move-on {
  @apply text-slate-700 hover:bg-white;
}
</style>
