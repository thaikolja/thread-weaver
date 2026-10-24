<script
  setup
  lang="ts"
>
/** Shared editor. Totals and the download live on it. */

const weaver = useWeaver()
</script>

<template>
  <div class="mt-14 border-t-2 border-dashed border-slate-200 pt-8">
    <div class="mx-auto max-w-2xl space-y-6 rounded-3xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50/80 p-6 text-center shadow-sm sm:p-10">
      <div class="inline-flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
        <UIcon
          name="i-lucide-check"
          class="size-6"
        />
      </div>
      <div class="space-y-1.5">
        <h3 class="text-2xl font-extrabold tracking-tight text-slate-950">
          Sequence Ready to Ship
        </h3>
        <p class="text-xs text-slate-500 sm:text-sm">
          Partitioned into <span class="font-bold text-slate-900">{{
          weaver.posts.length
        }} post{{ weaver.posts.length === 1 ? '' : 's' }}</span>. Estimated read time:
          <span class="font-bold text-slate-900">{{ weaver.readMinutes }} min</span>.
        </p>
      </div>
      <div class="grid grid-cols-3 gap-2 border-y border-slate-100 py-2 text-xs sm:gap-4">
        <div class="rounded-xl border border-slate-100 bg-white p-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-3">
          <span class="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Total Length</span>
          <span class="font-mono text-sm font-semibold text-slate-900">{{ weaver.totalCharacterCount }} chars</span>
        </div>
        <div class="rounded-xl border border-slate-100 bg-white p-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-3">
          <span class="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Total Words</span>
          <span class="font-mono text-sm font-semibold text-slate-900">{{ weaver.wordCount }}</span>
        </div>
        <div class="rounded-xl border border-slate-100 bg-white p-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-3">
          <span class="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Format Target</span>
          <span class="text-sm font-semibold text-slate-900">{{ weaver.platformName }}</span>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          class="btn-tactile flex w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 hover:shadow-lg sm:w-auto"
          @click="weaver.copyAll()"
        >
          <UIcon
            v-if="!weaver.allCopied"
            name="i-lucide-copy"
            class="size-4"
          />
          <UIcon
            v-else
            name="i-lucide-check"
            class="size-4 text-emerald-400"
          />
          <span>{{ weaver.allCopied ? 'All Posts Stored to Clipboard!' : 'Copy Entire Sequence' }}</span>
        </button>
        <button
          type="button"
          class="btn-tactile flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
          @click="weaver.download()"
        >
          <UIcon
            name="i-lucide-download"
            class="size-4 text-slate-500"
          />
          <span>Download .md</span>
        </button>
      </div>
    </div>
  </div>
</template>
