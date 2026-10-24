<script setup lang="ts">
/** Button colors for the four corsets. */

import { platformButtonClass } from '~/utils/weaver/platformClass'

/** Shared editor. The page calls provideWeaver(). */

const weaver = useWeaver()
</script>

<template>
  <div class="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
    <span class="text-xs font-bold tracking-wider text-slate-400 uppercase">Platform Corset</span>
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="btn-tactile flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs"
        :class="platformButtonClass('x', weaver.platform)"
        @click="weaver.choosePlatform('x')"
      >
        <svg
          class="size-3"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>X (280)</span>
      </button>
      <button
        type="button"
        class="btn-tactile flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs"
        :class="platformButtonClass('bsky', weaver.platform)"
        @click="weaver.choosePlatform('bsky')"
      >
        <svg
          class="size-3.5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.01 0 1.88 0 4.99c0 1.025.544 8.657.87 9.878.966 3.633 4.49 4.847 7.712 4.29-5.617 2.05-2.023 6.842 2.378 2.842 1.488-1.353 1.04-1.2 1.04-1.2s-.448-.153 1.04 1.2c4.401 4 7.995-.792 2.378-2.842 3.222.557 6.746-.657 7.712-4.29.326-1.22.87-8.853.87-9.878 0-3.11-2.566-3.98-5.202-2.185-2.752 1.942-5.711 5.881-6.798 7.995z" />
        </svg>
        <span>Bluesky (300)</span>
      </button>
      <button
        type="button"
        class="btn-tactile flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs"
        :class="platformButtonClass('threads', weaver.platform)"
        @click="weaver.choosePlatform('threads')"
      >
        <svg
          class="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="M10 9a2 2 0 1 1 3.5 1.5c-.8.8-1.5 1.5-1.5 2.5" />
        </svg>
        <span>Threads (500)</span>
      </button>
      <button
        type="button"
        class="btn-tactile flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs"
        :class="platformButtonClass('masto', weaver.platform)"
        @click="weaver.choosePlatform('masto')"
      >
        <svg
          class="size-3.5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61C17.157 2.378 14.593 2 12.016 2h-.032c-2.577 0-5.141.378-6.468.956 0 0-2.843 1.271-2.843 5.61 0 .993-.015 2.186.012 3.393.101 4.549.806 9.006 5.215 10.158 2.052.535 3.82.593 5.263.475 2.617-.215 4.093-1.375 4.093-1.375l-.057-1.246s-1.851.583-3.924.524c-2.058-.058-4.22-.19-4.526-2.618a5.1 5.1 0 0 1-.035-.615c4.013 1.05 8.271.614 9.45-.195 2.47-.945 3.12-4.143 3.175-7.501z" />
        </svg>
        <span>Mastodon (500)</span>
      </button>
    </div>
  </div>
</template>
