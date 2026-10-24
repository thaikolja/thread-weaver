<script setup lang="ts">
import type { NuxtError } from '#app'

/**
 * Fallback for Nuxt errors. The workbench itself stays on `/`.
 */
defineProps<{
  error: NuxtError
}>()

function goHome(): void {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-[#f4f5f7] px-6 text-center font-sans text-slate-900">
    <p class="text-xs font-bold tracking-wider text-slate-400 uppercase">
      Thread Weaver
    </p>
    <h1 class="mt-3 text-4xl font-black tracking-tight text-slate-950">
      {{ error.statusCode }}
    </h1>
    <p class="mt-2 max-w-md text-sm text-slate-500">
      {{ error.message }}
    </p>
    <button
      type="button"
      class="btn-tactile mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
      @click="goHome"
    >
      Back to the workbench
    </button>
  </div>
</template>
