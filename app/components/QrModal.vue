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

<script
  setup
  lang="ts"
>
/** Shared editor. The modal opens when a post asks for a QR. */

const weaver     = useWeaver()
const fullCards  = computed(() => weaver.shownPosts.map(post => post.compiled).join('\n\n'))
const qrCodeData = useQrcode('https://nuxt.com', {
  toBase64: true,
})
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
      <h4 class="text-xl font-bold">
        {{ $t('qr.title') }}
      </h4>
      <div class="c-qr-frame">
        <NuxtImg
          :src="qrCodeData"
          alt="Image"
        />
      </div>
      <p class="text-dimmed">
        {{ $t('qr.help') }}
      </p>
      <button
        type="button"
        class="c-qr-close"
        @click="weaver.closeQr()"
      >
        {{ $t('qr.close') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-qr-backdrop {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm;
}

.c-qr-dialog {
  @apply w-full max-w-sm space-y-4 rounded-3xl border-slate-100 bg-white p-6 text-center shadow-2xl;
}

.c-qr-frame {
  @apply flex items-center justify-center rounded-2xl bg-slate-50 p-4;
}

.c-qr-close {
  @apply btn-tactile w-full  rounded-xl bg-black py-2 text-sm font-semibold text-white hover:bg-black/80
}
</style>
