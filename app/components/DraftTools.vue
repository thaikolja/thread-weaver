<script setup lang="ts">
/** Shared editor. Text tools, the raw character count, and Clear. */
const weaver = useWeaver()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <label class="flex cursor-pointer items-center gap-1.5 text-slate-500 select-none hover:text-slate-900">
        <UIcon
          name="i-lucide-case-sensitive"
          class="size-3.5 text-slate-400"
        />
        <input
          v-model="weaver.capitalize"
          type="checkbox"
          class="size-4 rounded accent-slate-950"
        >
        <span>Capitalize posts</span>
      </label>
      <label class="flex cursor-pointer items-center gap-1.5 text-slate-500 select-none hover:text-slate-900">
        <UIcon
          name="i-lucide-circle-ellipsis"
          class="size-3.5 text-slate-400"
        />
        <input
          v-model="weaver.finishSentences"
          type="checkbox"
          class="size-4 rounded accent-slate-950"
        >
        <span>Finish sentences</span>
      </label>
      <label class="flex cursor-pointer items-center gap-1.5 text-slate-500 select-none hover:text-slate-900">
        <UIcon
          name="i-lucide-wrap-text"
          class="size-3.5 text-slate-400"
        />
        <input
          v-model="weaver.keepBreaks"
          type="checkbox"
          class="size-4 rounded accent-slate-950"
        >
        <span>Keep line breaks</span>
      </label>
    </div>
    <div class="ml-auto flex items-center gap-4">
      <span class="font-mono text-slate-400">{{ weaver.source.length }} characters</span>
      <button
        v-if="weaver.source"
        type="button"
        class="btn-tactile flex items-center gap-1 font-semibold text-slate-400 hover:text-red-500"
        @click="weaver.source = ''"
      >
        <UIcon
          name="i-lucide-trash"
          class="size-3.5"
        />
        <span>Clear</span>
      </button>
    </div>
  </div>
</template>
