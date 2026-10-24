<script setup lang="ts">
/** Shared editor. The modal opens when a post asks for a QR. */

const weaver = useWeaver()
</script>

<template>
  <div
    v-if="weaver.activeQrUrl"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    @click="weaver.closeQr()"
  >
    <div
      class="w-full max-w-xs space-y-4 rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-2xl"
      @click.stop
    >
      <h4 class="text-sm font-bold text-slate-900">
        Scan to Transfer Segment
      </h4>
      <div class="flex items-center justify-center rounded-2xl bg-slate-50 p-4">
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
        class="btn-tactile w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        @click="weaver.closeQr()"
      >
        Close
      </button>
    </div>
  </div>
</template>
