<script setup lang="ts">
import type { CompiledPost } from '~/utils/thread'

/**
 * Animated list of compiled posts plus the sequence copy control.
 */
defineProps<{
  posts: CompiledPost[]
  limit: number
  platformLabel: string
  copiedPosts: Record<string, boolean>
  speakingId: string | null
  allCopied: boolean
}>()

const emit = defineEmits<{
  copy: [text: string, id: string]
  copyAll: []
  move: [index: number, delta: number]
  drop: [index: number]
  send: [text: string]
  listen: [text: string, id: string]
  qr: [text: string]
}>()
</script>

<template>
  <div class="space-y-6">
    <div class="flex min-h-[44px] flex-wrap items-center justify-between gap-3 px-1">
      <div class="flex items-center gap-3">
        <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white tabular-nums shadow-sm">
          {{ posts.length }}
        </div>
        <div class="flex h-9 flex-col justify-center">
          <h2 class="mb-1 text-base leading-none font-bold text-slate-900">
            Bite-Sized Payload
          </h2>
          <p class="text-xs leading-none text-slate-400 tabular-nums">
            Fixed sequence overview: {{ posts.length }} total post{{ posts.length === 1 ? '' : 's' }}
          </p>
        </div>
      </div>
      <button
        type="button"
        class="btn-tactile ml-auto flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        @click="emit('copyAll')"
      >
        <UIcon
          name="i-lucide-copy"
          class="size-3.5"
        />
        <span>{{ allCopied ? 'All Copied!' : 'Copy Entire Sequence' }}</span>
      </button>
    </div>

    <div class="relative">
      <div class="absolute top-8 bottom-8 left-6 -z-0 hidden w-0.5 bg-slate-200 sm:block" />
      <TransitionGroup
        name="thread-chain"
        tag="div"
        class="relative space-y-4 sm:space-y-6"
      >
        <ThreadPostCard
          v-for="(post, index) in posts"
          :key="post.id"
          :post="post"
          :index="index"
          :total="posts.length"
          :limit="limit"
          :platform-label="platformLabel"
          :copied="Boolean(copiedPosts[post.id])"
          :speaking="speakingId === post.id"
          @copy="emit('copy', post.compiled, post.id)"
          @move="emit('move', index, $event)"
          @drop="emit('drop', index)"
          @send="emit('send', post.compiled)"
          @listen="emit('listen', post.compiled, post.id)"
          @qr="emit('qr', post.compiled)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>
