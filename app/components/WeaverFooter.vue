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
/**
 * Offline footnote from the template. The QR action still calls a remote image service.
 */
</script>

<template>
  <footer class="c-footer">
    <span>Zero remote servers. Zero telemetry. No excuses for publishing walls of text.</span>
    <div class="flex items-center gap-4">
      <span>Offline Functional</span>
      <span>•</span>
      <span>Client-Side Partitioning</span>
    </div>
  </footer>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-footer {
  @apply mt-16 flex flex-col items-center justify-between gap-3 border-t border-slate-200/60 pt-6 text-center text-xs text-slate-400 sm:mt-20 sm:flex-row sm:text-left;
}
</style>
