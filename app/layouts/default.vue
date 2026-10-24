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
 * Light canvas for the one-page tool. No starter header or footer.
 */
</script>

<template>
  <div class="c-canvas">
    <slot />
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-canvas {
  @apply flex min-h-screen flex-col bg-[#f4f5f7] font-sans text-slate-900 antialiased selection:bg-slate-900 selection:text-white;
}
</style>
