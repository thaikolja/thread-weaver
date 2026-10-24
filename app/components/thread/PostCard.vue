<script setup lang="ts">
import { ringColor, ringDashOffset } from '~/utils/thread'
import type { CompiledPost } from '~/utils/thread'

/**
 * One compiled post: reorder, length ring, copy, send, listen, QR, and drop.
 */
const props = defineProps<{
  post: CompiledPost
  index: number
  total: number
  limit: number
  platformLabel: string
  copied: boolean
  speaking: boolean
}>()

const emit = defineEmits<{
  copy: []
  move: [delta: number]
  drop: []
  send: []
  listen: []
  qr: []
}>()

const stroke = computed(() => ringColor(props.post.compiled.length, props.limit))
const dash = computed(() => ringDashOffset(props.post.compiled.length, props.limit))
</script>

<template>
  <div
    class="relative z-10 space-y-4 rounded-2xl border p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-colors hover:border-slate-300 sm:rounded-3xl sm:p-6 md:p-8"
    :class="index % 2 === 0 ? 'border-slate-200/90 bg-white' : 'border-[#edebe6] bg-[#faf9f6]'"
  >
    <div class="flex items-center justify-between gap-2 border-b border-slate-100/80 pb-3">
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="flex items-center rounded-lg border border-slate-200/60 bg-slate-100 p-0.5">
          <button
            type="button"
            title="Move Up"
            aria-label="Move Up"
            class="btn-tactile rounded-md p-1 transition"
            :class="index === 0 ? 'cursor-not-allowed opacity-30' : 'text-slate-700 hover:bg-white'"
            :disabled="index === 0"
            @click="emit('move', -1)"
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
            @click="emit('move', 1)"
          >
            <UIcon
              name="i-lucide-chevron-down"
              class="size-3.5"
            />
          </button>
        </div>
        <span class="text-xs font-semibold tracking-wider text-slate-500 uppercase tabular-nums">
          Post {{ index + 1 }} of {{ total }}
        </span>
      </div>
      <div class="flex items-center gap-2 sm:gap-4">
        <div class="flex items-center gap-1.5 sm:gap-2">
          <div class="relative flex size-5 shrink-0 items-center justify-center">
            <svg
              class="size-full -rotate-90"
              viewBox="0 0 36 36"
              aria-hidden="true"
            >
              <path
                class="text-slate-100"
                stroke-width="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                :stroke="stroke"
                stroke-dasharray="100, 100"
                :stroke-dashoffset="dash"
                stroke-width="3.5"
                stroke-linecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <span
            class="font-mono text-xs font-semibold tabular-nums"
            :style="{ color: stroke }"
          >
            {{ post.compiled.length }}/{{ limit }}
          </span>
        </div>
        <button
          type="button"
          class="btn-tactile flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition"
          :class="copied ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-transparent bg-slate-50 text-slate-700 hover:bg-slate-900 hover:text-white'"
          @click="emit('copy')"
        >
          <UIcon
            v-if="copied"
            name="i-lucide-check"
            class="size-3.5 text-emerald-600"
          />
          <UIcon
            v-else
            name="i-lucide-copy"
            class="size-3.5"
          />
          <span>{{ copied ? 'Copied' : 'Copy' }}</span>
        </button>
      </div>
    </div>

    <div
      class="group relative cursor-copy rounded-2xl border border-slate-200/90 bg-white p-4 transition-colors hover:border-slate-300"
      title="Click anywhere to copy this chunk"
      @click="emit('copy')"
    >
      <div class="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-slate-800 select-none sm:text-base">
        {{ post.compiled }}
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="btn-tactile flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-200"
          title="Send directly to current platform intent"
          @click="emit('send')"
        >
          <UIcon
            name="i-lucide-external-link"
            class="size-3.5 text-slate-500"
          />
          <span>Send to {{ platformLabel }}</span>
        </button>
        <button
          type="button"
          class="btn-tactile flex items-center gap-1.5 rounded-xl px-2.5 py-1 font-medium transition"
          :class="speaking ? 'border border-amber-200 bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          title="Listen to this post to verify cadence and pacing"
          @click="emit('listen')"
        >
          <UIcon
            name="i-lucide-volume-2"
            class="size-3.5"
          />
          <span>{{ speaking ? 'Speaking...' : 'Listen' }}</span>
        </button>
        <button
          type="button"
          class="btn-tactile flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-200"
          title="Generate QR code to scan directly onto phone"
          @click="emit('qr')"
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
        @click="emit('drop')"
      >
        <UIcon
          name="i-lucide-trash-2"
          class="size-3.5"
        />
        <span>Drop</span>
      </button>
    </div>
  </div>
</template>
