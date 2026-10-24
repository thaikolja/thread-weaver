<script setup lang="ts">
/**
 * Light canvas for the one-page tool. No starter header or footer.
 */
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#f4f5f7] font-sans text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
    <slot />
  </div>
</template>
