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
/** One editor, shared with every section below. */
provideWeaver()

/** Search engines read this from the server HTML. */
useToolSchema()
</script>

<template>
  <div class="c-page">
    <WeaverHeader />
    <main class="space-y-8 sm:space-y-10">
      <WeaverWorkbench />
      <FoldReveal
        tag="section"
        class="space-y-6"
      >
        <PostList />
        <ShipStation />
      </FoldReveal>
    </main>
    <QrModal />
    <FoldReveal>
      <WeaverFooter />
    </FoldReveal>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-page {
  @apply mx-auto flex w-full max-w-4xl flex-1 flex-col justify-between px-4 py-8 sm:px-6 sm:py-12 md:py-16;
}
</style>
