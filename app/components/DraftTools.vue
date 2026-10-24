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
/** Shared editor. Text tools, the raw character count, and Clear. */
const weaver = useWeaver()
</script>

<template>
  <div class="c-tools">
    <div class="c-tools-options">
      <label class="c-tool">
        <UIcon
          name="i-lucide-case-sensitive"
          class="c-tool-icon"
        />
        <input
          v-model="weaver.capitalize"
          type="checkbox"
          class="c-tool-check"
        >
        <span>Capitalize posts</span>
      </label>
      <label class="c-tool">
        <UIcon
          name="i-lucide-circle-ellipsis"
          class="c-tool-icon"
        />
        <input
          v-model="weaver.finishSentences"
          type="checkbox"
          class="c-tool-check"
        >
        <span>Finish sentences</span>
      </label>
      <label class="c-tool">
        <UIcon
          name="i-lucide-wrap-text"
          class="c-tool-icon"
        />
        <input
          v-model="weaver.keepBreaks"
          type="checkbox"
          class="c-tool-check"
        >
        <span>Keep line breaks</span>
      </label>
    </div>
    <div class="ml-auto flex items-center gap-4">
      <span class="font-mono text-slate-600">{{ weaver.source.length }} characters</span>
      <button
        v-if="weaver.source"
        type="button"
        class="c-clear"
        @click="weaver.source = ''"
      >
        <UIcon
          name="i-lucide-trash"
          class="size-3.5"
        />
        <span>Clear</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-tools {
  @apply flex flex-wrap items-center justify-between gap-3 pt-2 text-xs;
}

.c-tools-options {
  @apply flex flex-wrap items-center gap-x-4 gap-y-2;
}

.c-tool {
  @apply flex cursor-pointer items-center gap-1.5 text-slate-500 select-none hover:text-slate-900;
}

.c-tool-icon {
  @apply size-3.5 text-slate-400;
}

.c-tool-check {
  @apply size-4 rounded accent-slate-950;
}

.c-clear {
  @apply btn-tactile flex items-center gap-1 font-semibold text-slate-600 hover:text-red-500;
}
</style>
