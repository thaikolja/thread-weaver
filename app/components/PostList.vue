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
/** Shared editor. The list just reads the compiled posts. */

const weaver = useWeaver()
</script>

<template>
  <div class="space-y-6">
    <div class="c-list-head">
      <div class="flex items-center gap-3">
        <div class="c-list-count">
          {{ weaver.shownPosts.length }}
        </div>
        <div class="flex h-9 flex-col justify-center">
          <h2 class="c-list-title">
            Bite-Sized Payload
          </h2>
          <p class="c-list-meta">
            Fixed sequence overview: {{ weaver.shownPosts.length }} total post{{ weaver.shownPosts.length === 1 ? '' : 's' }}
          </p>
        </div>
      </div>
      <button
        type="button"
        class="c-list-copy"
        @click="weaver.copyAll()"
      >
        <UIcon
          name="i-lucide-copy"
          class="size-3.5"
        />
        <span>{{ weaver.allCopied ? 'All Copied!' : 'Copy Entire Sequence' }}</span>
      </button>
    </div>

    <div
      v-if="weaver.shownPosts.length"
      class="relative"
    >
      <div class="c-list-spine" />
      <TransitionGroup
        name="thread-chain"
        tag="div"
        class="relative space-y-4 sm:space-y-6"
      >
        <PostCard
          v-for="(post, index) in weaver.shownPosts"
          :key="post.id"
          :post="post"
          :index="index"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-list-head {
  @apply flex min-h-[44px] flex-wrap items-center justify-between gap-3 px-1;
}

.c-list-count {
  @apply flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white tabular-nums shadow-sm;
}

.c-list-title {
  @apply mb-1 text-base leading-none font-bold text-slate-900;
}

.c-list-meta {
  @apply text-xs leading-none text-slate-400 tabular-nums;
}

.c-list-copy {
  @apply btn-tactile ml-auto flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800;
}

.c-list-spine {
  @apply absolute top-8 bottom-8 left-6 -z-0 hidden w-0.5 bg-slate-200 sm:block;
}
</style>
