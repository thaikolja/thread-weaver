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
/** Shared editor. */

const weaver = useWeaver()
</script>

<template>
  <div class="c-source">
    <label
      class="sr-only"
      for="weaver-source"
    >
      {{ $t('source.label') }}
    </label>
    <textarea
      id="weaver-source"
      v-model="weaver.source"
      rows="6"
      :placeholder="$t('source.placeholder')"
      class="c-source-input"
    />
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-source {
  @apply rounded-2xl border border-slate-200/90 bg-white p-3.5 transition-all focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100;
}

.c-source-input {
  @apply w-full resize-y bg-transparent text-[16px] leading-relaxed font-medium text-slate-800 outline-none placeholder:text-slate-300 sm:text-[18px];
}
</style>
