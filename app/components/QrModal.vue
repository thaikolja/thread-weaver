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
/** Shared editor. The modal opens when a post asks for a QR. */

const weaver = useWeaver()
</script>

<template>
  <div
    v-if="weaver.activeQrUrl"
    class="c-qr-backdrop"
    @click="weaver.closeQr()"
  >
    <div
      class="c-qr-dialog"
      @click.stop
    >
      <h4 class="text-sm font-bold text-slate-900">
        Scan to Transfer Segment
      </h4>
      <div class="c-qr-frame">
        <img
          :src="weaver.activeQrUrl"
          alt="QR Code"
          class="size-44 rounded-lg"
        >
      </div>
      <p class="text-[11px] text-slate-400">
        Scan with camera to open text directly on your device.
      </p>
      <button
        type="button"
        class="c-qr-close"
        @click="weaver.closeQr()"
      >
        Close
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-qr-backdrop {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm;
}

.c-qr-dialog {
  @apply w-full max-w-xs space-y-4 rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-2xl;
}

.c-qr-frame {
  @apply flex items-center justify-center rounded-2xl bg-slate-50 p-4;
}

.c-qr-close {
  @apply btn-tactile w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200;
}
</style>
