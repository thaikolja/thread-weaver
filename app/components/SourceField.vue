<script setup lang="ts">
/** Shared editor. */

const weaver = useWeaver()
</script>

<template>
  <div class="rounded-2xl border border-slate-200/90 bg-white p-3.5 transition-all focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
    <textarea
      v-model="weaver.source"
      rows="6"
      placeholder="Paste your unhinged monologue here..."
      class="w-full resize-y bg-transparent text-[16px] leading-relaxed font-medium text-slate-800 outline-none placeholder:text-slate-300 sm:text-[18px]"
    />
  </div>
</template>
