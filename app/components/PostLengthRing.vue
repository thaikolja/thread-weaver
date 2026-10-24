<!--
  - Thread Weaver
  -
  - @description     Online tool to split long messages into parts for character-limited platforms
  - @author          Kolja Nolte <kolja.nolte@gmail.com>
  - @copyright       2026 (C) Kolja Nolte
  - @see             https://www.kolja-nolte.com
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - @package Thread Weaver
  -->

<script setup lang="ts">
/** Ring color and how full the circle is. */

import { ringColor, ringDashOffset } from '~/utils/weaver/metrics'

/** Compiled length against the active platform limit. */

const props = defineProps<{
  length: number
  limit: number
}>()

/** Green when short, red when the post is over the limit. */

const stroke = computed(() => ringColor(props.length, props.limit))

/** How much of the ring is still empty. */

const dash = computed(() => ringDashOffset(props.length, props.limit))
</script>

<template>
  <div class="flex items-center gap-1.5 sm:gap-2">
    <div class="c-ring">
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
      {{ length }}/{{ limit }}
    </span>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-ring {
  @apply relative flex size-5 shrink-0 items-center justify-center;
}
</style>
