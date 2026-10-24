<script setup lang="ts">
/** Which card this is, so the first and last arrows can disable themselves. */

defineProps<{
  index: number
  total: number
}>()

/** Shared editor. Move does not repack the text. */

const weaver = useWeaver()
</script>

<template>
  <div class="flex items-center rounded-lg border border-slate-200/60 bg-slate-100 p-0.5">
    <button
      type="button"
      title="Move Up"
      aria-label="Move Up"
      class="btn-tactile rounded-md p-1 transition"
      :class="index === 0 ? 'cursor-not-allowed opacity-30' : 'text-slate-700 hover:bg-white'"
      :disabled="index === 0"
      @click="weaver.move(index, -1)"
    >
      <UIcon
        name="i-lucide-chevron-up"
        class="size-3.5"
      />
    </button>
    <button
      type="button"
      title="Move Down"
      aria-label="Move Down"
      class="btn-tactile rounded-md p-1 transition"
      :class="index === total - 1 ? 'cursor-not-allowed opacity-30' : 'text-slate-700 hover:bg-white'"
      :disabled="index === total - 1"
      @click="weaver.move(index, 1)"
    >
      <UIcon
        name="i-lucide-chevron-down"
        class="size-3.5"
      />
    </button>
  </div>
</template>
