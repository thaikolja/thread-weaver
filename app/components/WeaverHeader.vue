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
/**
 * Thread Weaver masthead: kicker, wordmark, and the template tagline.
 */
</script>

<template>
  <header class="mb-8 space-y-3 sm:mb-10 sm:space-y-4">
    <div class="c-kicker">
      <img
        src="/logo.svg"
        alt=""
        width="16"
        height="16"
        class="size-4 shrink-0"
      >
      <span>Attention Span Reducer</span>
    </div>
    <h1 class="c-wordmark">
      THREAD<br>WEAVER.
    </h1>
    <p class="c-tagline">
      Because nobody on the timeline reads more than three sentences without suffering dopamine withdrawal.
    </p>
  </header>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-kicker {
  @apply flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase;
}

.c-wordmark {
  @apply text-5xl leading-[0.9] font-black tracking-tight text-slate-950 sm:text-7xl md:text-8xl;
}

.c-tagline {
  @apply max-w-xl pt-1 text-sm font-medium text-slate-500 sm:text-base md:text-lg;
}
</style>
