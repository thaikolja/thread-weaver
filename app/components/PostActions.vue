<script setup lang="ts">
/** The compiled post these buttons act on. */

import type { CompiledPost } from '~/utils/weaver/types'

defineProps<{
  post: CompiledPost
  index: number
}>()

/** Shared editor. */

const weaver = useWeaver()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="btn-tactile flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-200"
        title="Send directly to current platform intent"
        @click="weaver.send(post.compiled)"
      >
        <UIcon
          name="i-lucide-external-link"
          class="size-3.5 text-slate-500"
        />
        <span>Send to {{ weaver.platformName }}</span>
      </button>
      <button
        type="button"
        class="btn-tactile flex items-center gap-1.5 rounded-xl px-2.5 py-1 font-medium transition"
        :class="weaver.speakingId === post.id ? 'border border-amber-200 bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        title="Listen to this post to verify cadence and pacing"
        @click="weaver.listen(post.compiled, post.id)"
      >
        <UIcon
          name="i-lucide-volume-2"
          class="size-3.5"
        />
        <span>{{ weaver.speakingId === post.id ? 'Speaking...' : 'Listen' }}</span>
      </button>
      <button
        type="button"
        class="btn-tactile flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-200"
        title="Generate QR code to scan directly onto phone"
        @click="weaver.openQr(post.compiled)"
      >
        <UIcon
          name="i-lucide-qr-code"
          class="size-3.5 text-slate-500"
        />
        <span>Send to Phone</span>
      </button>
    </div>
    <button
      type="button"
      class="btn-tactile flex items-center gap-1 p-1 font-semibold text-slate-400 hover:text-red-500"
      @click="weaver.drop(index)"
    >
      <UIcon
        name="i-lucide-trash-2"
        class="size-3.5"
      />
      <span>Drop</span>
    </button>
  </div>
</template>
