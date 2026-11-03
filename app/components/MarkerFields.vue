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
      <label
        class="c-field-label"
        for="weaver-marker"
      >
        <UIcon
          name="i-ph-hash"
          class="size-3.5"
        />
        {{ $t('marker.style') }}
      </label>
      <select
        id="weaver-marker"
        v-model="weaver.marker"
        class="c-field-select"
      >
        <option value="parens">
          {{ $t('marker.parens') }}
        </option>
        <option value="brackets">
          {{ $t('marker.brackets') }}
        </option>
        <option value="slash">
          {{ $t('marker.slash') }}
        </option>
        <option value="hash">
          {{ $t('marker.hash') }}
        </option>
        <option value="none">
          {{ $t('marker.none') }}
        </option>
      </select>
    </div>
    <div class="space-y-1.5">
      <label
        class="c-field-label"
        for="weaver-placement"
      >
        <UIcon
          name="i-ph-text-align-justify"
          class="size-3.5"
        />
        {{ $t('marker.placement') }}
      </label>
      <select
        id="weaver-placement"
        v-model="weaver.placement"
        class="c-field-select"
      >
        <option value="newline">
          {{ $t('marker.newline') }}
        </option>
        <option value="inline-after">
          {{ $t('marker.inlineAfter') }}
        </option>
        <option value="inline-before">
          {{ $t('marker.inlineBefore') }}
        </option>
        <option value="start">
          {{ $t('marker.start') }}
        </option>
      </select>
    </div>
    <div class="space-y-1.5">
      <label
        class="c-field-label"
        for="weaver-bridge"
      >
        <UIcon
          name="i-ph-dots-three"
          class="size-3.5"
        />
        {{ $t('marker.bridge') }}
      </label>
      <input
        id="weaver-bridge"
        v-model="weaver.bridge"
        type="text"
        :placeholder="$t('marker.bridgePlaceholder')"
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
  @apply flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-600 uppercase;
}

.c-field-select {
  @apply w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pr-10 pl-3 text-slate-700 outline-none hover:border-slate-300;
  background-image:      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cpath fill='%2394a3b8' d='m213.66 101.66-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32'/%3E%3C/svg%3E");
  background-repeat:     no-repeat;
  background-position:   right 0.8rem center;
  background-size:       1rem;
}

.c-field-input {
  @apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none placeholder:text-slate-300 hover:border-slate-300 focus:border-slate-400;
}
</style>
