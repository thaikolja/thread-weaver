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
/** Shared editor. Marker, placement, and bridge update the posts as they change. */

const weaver = useWeaver()
</script>

<template>
  <div class="c-markers">
    <div class="space-y-1.5">
      <label class="c-field-label">
        <UIcon
          name="i-lucide-hash"
          class="size-3.5"
        />
        Marker Style
      </label>
      <select
        v-model="weaver.marker"
        class="c-field-select"
      >
        <option value="parens">
          (1/n) Parentheses
        </option>
        <option value="brackets">
          [1/n] Brackets
        </option>
        <option value="slash">
          1/n Raw Fraction
        </option>
        <option value="hash">
          #1 Number Tag
        </option>
        <option value="none">
          None (Live Dangerously)
        </option>
      </select>
    </div>
    <div class="space-y-1.5">
      <label class="c-field-label">
        <UIcon
          name="i-lucide-align-justify"
          class="size-3.5"
        />
        Placement
      </label>
      <select
        v-model="weaver.placement"
        class="c-field-select"
      >
        <option value="newline">
          New Line (Bottom)
        </option>
        <option value="inline-after">
          Inline (After text)
        </option>
        <option value="inline-before">
          Inline (Before text)
        </option>
        <option value="start">
          Header (Top of segment)
        </option>
      </select>
    </div>
    <div class="space-y-1.5">
      <label class="c-field-label">
        <UIcon
          name="i-lucide-ellipsis"
          class="size-3.5"
        />
        Custom Bridge
      </label>
      <input
        v-model="weaver.bridge"
        type="text"
        placeholder="e.g. ..., //, ››"
        class="c-field-input"
      >
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-markers {
  @apply grid grid-cols-1 gap-3 text-xs sm:grid-cols-3 sm:gap-4;
}

.c-field-label {
  @apply flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase;
}

.c-field-select {
  @apply w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none hover:border-slate-300;
}

.c-field-input {
  @apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none placeholder:text-slate-300 hover:border-slate-300 focus:border-slate-400;
}
</style>
