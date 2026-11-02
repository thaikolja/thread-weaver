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
/** This card's compiled post and where it sits in the list. */

import type { CompiledPost } from '~/utils/weaver/types'

defineProps<{
  post: CompiledPost
  index: number
}>()

/** Shared editor. Copy, the limit, and the list length live here. */

const weaver = useWeaver()
</script>

<template>
  <div
    class="c-post"
    :class="index % 2 === 0 ? 'c-post-even' : 'c-post-odd'"
  >
    <div class="c-post-head">
      <div class="flex items-center gap-2 sm:gap-3">
        <PostMoveButtons
          :index="index"
          :total="weaver.posts.length"
        />
        <span class="c-post-index">
          {{ $t('post.position', { index: index + 1, total: weaver.posts.length }) }}
        </span>
      </div>
      <div class="flex items-center gap-2 sm:gap-4">
        <PostLengthRing
          :length="post.compiled.length"
          :limit="weaver.limit"
        />
        <button
          type="button"
          class="c-copy"
          :class="weaver.copiedPosts[post.id] ? 'c-copy-done' : 'c-copy-idle'"
          @click="weaver.copyPost(post.compiled, post.id)"
        >
          <UIcon
            v-if="weaver.copiedPosts[post.id]"
            name="i-ph-check"
            class="size-3.5 text-emerald-600"
          />
          <UIcon
            v-else
            name="i-ph-copy"
            class="size-3.5"
          />
          <span>{{ weaver.copiedPosts[post.id] ? $t('post.copied') : $t('post.copy') }}</span>
        </button>
      </div>
    </div>

    <div
      class="group c-post-body"
      :title="$t('post.copyTitle')"
      @click="weaver.copyPost(post.compiled, post.id)"
    >
      <div class="c-post-text">
        {{ post.compiled }}
      </div>
    </div>

    <PostActions
      :post="post"
      :index="index"
    />
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-post {
  @apply relative z-10 space-y-4 rounded-2xl border p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-colors hover:border-slate-300 sm:rounded-3xl sm:p-6 md:p-8;
}

.c-post-even {
  @apply border-slate-200/90 bg-white;
}

.c-post-odd {
  @apply border-[#edebe6] bg-[#faf9f6];
}

.c-post-head {
  @apply flex items-center justify-between gap-2 border-b border-slate-100/80 pb-3;
}

.c-post-index {
  @apply text-xs font-semibold tracking-wider text-slate-500 uppercase tabular-nums;
}

.c-copy {
  @apply btn-tactile flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition;
}

.c-copy-done {
  @apply border-emerald-200 bg-emerald-50 text-emerald-700;
}

.c-copy-idle {
  @apply border-transparent bg-slate-50 text-slate-700 hover:bg-slate-900 hover:text-white;
}

.c-post-body {
  @apply relative  rounded-2xl border border-slate-200/90 bg-slate-900/5 p-4 transition-colors
  hover:border-slate-300;
}

.c-post-text {
  @apply text-[15px] leading-relaxed break-words whitespace-pre-wrap text-slate-800 select-none sm:text-base;
}
</style>
