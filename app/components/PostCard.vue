<script setup lang="ts">
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
    class="relative z-10 space-y-4 rounded-2xl border p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-colors hover:border-slate-300 sm:rounded-3xl sm:p-6 md:p-8"
    :class="index % 2 === 0 ? 'border-slate-200/90 bg-white' : 'border-[#edebe6] bg-[#faf9f6]'"
  >
    <div class="flex items-center justify-between gap-2 border-b border-slate-100/80 pb-3">
      <div class="flex items-center gap-2 sm:gap-3">
        <PostMoveButtons
          :index="index"
          :total="weaver.posts.length"
        />
        <span class="text-xs font-semibold tracking-wider text-slate-500 uppercase tabular-nums">
          Post {{ index + 1 }} of {{ weaver.posts.length }}
        </span>
      </div>
      <div class="flex items-center gap-2 sm:gap-4">
        <PostLengthRing
          :length="post.compiled.length"
          :limit="weaver.limit"
        />
        <button
          type="button"
          class="btn-tactile flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition"
          :class="weaver.copiedPosts[post.id] ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-transparent bg-slate-50 text-slate-700 hover:bg-slate-900 hover:text-white'"
          @click="weaver.copyPost(post.compiled, post.id)"
        >
          <UIcon
            v-if="weaver.copiedPosts[post.id]"
            name="i-lucide-check"
            class="size-3.5 text-emerald-600"
          />
          <UIcon
            v-else
            name="i-lucide-copy"
            class="size-3.5"
          />
          <span>{{ weaver.copiedPosts[post.id] ? 'Copied' : 'Copy' }}</span>
        </button>
      </div>
    </div>

    <div
      class="group relative cursor-copy rounded-2xl border border-slate-200/90 bg-white p-4 transition-colors hover:border-slate-300"
      title="Click anywhere to copy this chunk"
      @click="weaver.copyPost(post.compiled, post.id)"
    >
      <div class="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-slate-800 select-none sm:text-base">
        {{ post.compiled }}
      </div>
    </div>

    <PostActions
      :post="post"
      :index="index"
    />
  </div>
</template>
