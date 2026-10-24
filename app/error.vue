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
import type { NuxtError } from '#app'

/**
 * Fallback for Nuxt errors. The workbench itself stays on `/`.
 */
defineProps<{
  error: NuxtError
}>()

function goHome(): void {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="c-error">
    <p class="c-error-kicker">
      Thread Weaver
    </p>
    <h1 class="c-error-code">
      {{ error.statusCode }}
    </h1>
    <p class="c-error-message">
      {{ error.message }}
    </p>
    <button
      type="button"
      class="c-error-home"
      @click="goHome"
    >
      Back to the workbench
    </button>
  </div>
</template>

<style scoped>
@reference "./assets/css/main.css";

.c-error {
  @apply flex min-h-screen flex-col items-center justify-center bg-[#f4f5f7] px-6 text-center font-sans text-slate-900;
}

.c-error-kicker {
  @apply text-xs font-bold tracking-wider text-slate-400 uppercase;
}

.c-error-code {
  @apply mt-3 text-4xl font-black tracking-tight text-slate-950;
}

.c-error-message {
  @apply mt-2 max-w-md text-sm text-slate-500;
}

.c-error-home {
  @apply btn-tactile mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white;
}
</style>
