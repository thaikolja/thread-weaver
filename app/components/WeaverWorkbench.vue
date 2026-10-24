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

<template>
  <section class="c-workbench">
    <PlatformPicker />
    <SourceField />
    <div class="c-workbench-tools">
      <MarkerFields />
      <DraftTools />
    </div>
  </section>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-workbench {
  @apply space-y-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_36px_rgba(0,0,0,0.03)] sm:rounded-3xl sm:p-6 md:p-8;
}

.c-workbench-tools {
  @apply space-y-4 border-t border-slate-100 pt-2;
}
</style>
