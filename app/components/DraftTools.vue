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
          name="i-ph-text-aa"
          class="c-tool-icon"
        />
        <input
          v-model="weaver.capitalize"
          type="checkbox"
          class="c-tool-check"
        >
        <span>{{ $t('tools.capitalize') }}</span>
      </label>
      <label class="c-tool">
        <UIcon
          name="i-ph-dots-three-circle"
          class="c-tool-icon"
        />
        <input
          v-model="weaver.finishSentences"
          type="checkbox"
          class="c-tool-check"
        >
        <span>{{ $t('tools.finish') }}</span>
      </label>
      <label class="c-tool">
        <UIcon
          name="i-ph-arrow-bend-down-left"
          class="c-tool-icon"
        />
        <input
          v-model="weaver.keepBreaks"
          type="checkbox"
          class="c-tool-check"
        >
        <span>{{ $t('tools.breaks') }}</span>
      </label>
    </div>
    <div class="ml-auto flex items-center gap-4">
      <span class="font-mono text-slate-600">{{ $t('tools.characters', { count: weaver.source.length }) }}</span>
      <button
        v-if="weaver.source"
        type="button"
        class="c-clear"
        @click="weaver.source = ''"
      >
        <UIcon
          name="i-ph-trash"
          class="size-3.5"
        />
        <span>{{ $t('tools.clear') }}</span>
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
  @apply size-4 shrink-0 cursor-pointer appearance-none rounded border border-slate-300 bg-white;
  background-repeat:   no-repeat;
  background-position: center;
  background-size:     0.85rem;
}

.c-tool-check:checked {
  border-color:     #0ea5e9;
  background-color: #38bdf8;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cpath fill='%23ffffff' d='m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32'/%3E%3C/svg%3E");
}

.c-tool-check:focus-visible {
  outline:        2px solid #38bdf8;
  outline-offset: 2px;
}

.c-clear {
  @apply btn-tactile flex items-center gap-1 font-semibold text-slate-600 hover:text-red-500;
}
</style>
