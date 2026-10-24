<script setup lang="ts">
import type { MarkerFormat, MarkerPlacement, PlatformId } from '~/utils/thread'

/**
 * Source editor: platform corset, monologue, marker style, placement, bridge, and flatten.
 */
const source = defineModel<string>('source', { required: true })
const marker = defineModel<MarkerFormat>('marker', { required: true })
const placement = defineModel<MarkerPlacement>('placement', { required: true })
const bridge = defineModel<string>('bridge', { required: true })
const flatten = defineModel<boolean>('flatten', { required: true })

defineProps<{
  platform: PlatformId
}>()

const emit = defineEmits<{
  platform: [platform: PlatformId]
}>()

const idlePlatform = 'border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'

const activePlatform: Record<PlatformId, string> = {
  x: 'border-black bg-black font-semibold text-white shadow-sm',
  bsky: 'border-[#0085ff] bg-[#0085ff] font-semibold text-white shadow-sm',
  threads: 'border-transparent bg-gradient-to-r from-pink-500 to-amber-500 font-semibold text-white shadow-sm',
  masto: 'border-[#6364ff] bg-[#6364ff] font-semibold text-white shadow-sm'
}
</script>

<template>
  <section class="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_36px_rgba(0,0,0,0.03)] sm:rounded-3xl sm:p-6 md:p-8">
    <div class="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
      <span class="text-xs font-bold tracking-wider text-slate-400 uppercase">Platform Corset</span>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="btn-tactile flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs"
          :class="platform === 'x' ? activePlatform.x : idlePlatform"
          @click="emit('platform', 'x')"
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
          :class="platform === 'bsky' ? activePlatform.bsky : idlePlatform"
          @click="emit('platform', 'bsky')"
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
          :class="platform === 'threads' ? activePlatform.threads : idlePlatform"
          @click="emit('platform', 'threads')"
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
          :class="platform === 'masto' ? activePlatform.masto : idlePlatform"
          @click="emit('platform', 'masto')"
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

    <div class="rounded-2xl border border-slate-200/90 bg-white p-3.5 transition-all focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
      <textarea
        v-model="source"
        rows="6"
        placeholder="Paste your unhinged monologue here..."
        class="w-full resize-y bg-transparent text-[16px] leading-relaxed font-medium text-slate-800 outline-none placeholder:text-slate-300 sm:text-[18px]"
      />
    </div>

    <div class="space-y-4 border-t border-slate-100 pt-2">
      <div class="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3 sm:gap-4">
        <div class="space-y-1.5">
          <label class="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <UIcon
              name="i-lucide-hash"
              class="size-3.5"
            />
            Marker Style
          </label>
          <select
            v-model="marker"
            class="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none hover:border-slate-300"
          >
            <option value="parens">
              (1/n) Parentheses
            </option>
            <option value="brackets">
              [1/n] Brackets
            </option>
            <option value="slash">
              1/n Raw Fraction
            </option>
            <option value="hash">
              #1 Number Tag
            </option>
            <option value="none">
              None (Live Dangerously)
            </option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <UIcon
              name="i-lucide-align-justify"
              class="size-3.5"
            />
            Placement
          </label>
          <select
            v-model="placement"
            class="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none hover:border-slate-300"
          >
            <option value="newline">
              New Line (Bottom)
            </option>
            <option value="inline-after">
              Inline (After text)
            </option>
            <option value="inline-before">
              Inline (Before text)
            </option>
            <option value="start">
              Header (Top of segment)
            </option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <UIcon
              name="i-lucide-ellipsis"
              class="size-3.5"
            />
            Custom Bridge
          </label>
          <input
            v-model="bridge"
            type="text"
            placeholder="e.g. ..., //, ››"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none placeholder:text-slate-300 hover:border-slate-300 focus:border-slate-400"
          >
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
        <label class="flex cursor-pointer items-center gap-2 text-slate-500 select-none hover:text-slate-900">
          <input
            v-model="flatten"
            type="checkbox"
            class="size-4 rounded accent-slate-950"
          >
          <span>Flatten blank lines</span>
        </label>
        <div class="ml-auto flex items-center gap-4">
          <span class="font-mono text-slate-400">{{ source.length }} characters</span>
          <button
            v-if="source"
            type="button"
            class="btn-tactile flex items-center gap-1 font-semibold text-slate-400 hover:text-red-500"
            @click="source = ''"
          >
            <UIcon
              name="i-lucide-trash"
              class="size-3.5"
            />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
