<script setup lang="ts">
/** Shared editor. The list just reads the compiled posts. */

const weaver = useWeaver()
</script>

<template>
  <div class="space-y-6">
    <div class="flex min-h-[44px] flex-wrap items-center justify-between gap-3 px-1">
      <div class="flex items-center gap-3">
        <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white tabular-nums shadow-sm">
          {{ weaver.posts.length }}
        </div>
        <div class="flex h-9 flex-col justify-center">
          <h2 class="mb-1 text-base leading-none font-bold text-slate-900">
            Bite-Sized Payload
          </h2>
          <p class="text-xs leading-none text-slate-400 tabular-nums">
            Fixed sequence overview: {{ weaver.posts.length }} total post{{ weaver.posts.length === 1 ? '' : 's' }}
          </p>
        </div>
      </div>
      <button
        type="button"
        class="btn-tactile ml-auto flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        @click="weaver.copyAll()"
      >
        <UIcon
          name="i-lucide-copy"
          class="size-3.5"
        />
        <span>{{ weaver.allCopied ? 'All Copied!' : 'Copy Entire Sequence' }}</span>
      </button>
    </div>

    <div class="relative">
      <div class="absolute top-8 bottom-8 left-6 -z-0 hidden w-0.5 bg-slate-200 sm:block" />
      <TransitionGroup
        name="thread-chain"
        tag="div"
        class="relative space-y-4 sm:space-y-6"
      >
        <PostCard
          v-for="(post, index) in weaver.posts"
          :key="post.id"
          :post="post"
          :index="index"
        />
      </TransitionGroup>
    </div>
  </div>
</template>
