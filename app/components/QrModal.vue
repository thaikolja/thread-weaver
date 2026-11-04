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
const weaver = useWeaver()

/** Close control. Focus lands here while the dialog is open. */
const closeButton = ref<HTMLButtonElement | null>(null)

/** Element that opened the dialog. Focus returns there. */
let returnFocus: HTMLElement | null = null

/** Escape closes even when focus sits on the backdrop. */
function onEscape(event: KeyboardEvent) {
  // Ignore every key except Escape.
  if (event.key !== 'Escape') {
    // Not the key we are waiting for.
    return
  }

  // Escape means close the QR layer.
  weaver.closeQr()
}

// Move focus into the dialog on open and back to the trigger on close.
watch(() => weaver.activeQrText, async (text) => {
  /** Closed. Hand focus back. */
  if (!text) {
    // Escape no longer needs to be watched.
    window.removeEventListener('keydown', onEscape)

    // Put focus back on the button that opened the modal.
    returnFocus?.focus()

    // Forget the old trigger.
    returnFocus = null

    // No dialog to focus.
    return
  }

  /** Remember the button that opened this layer. */
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null

  // Listen for Escape while the dialog is open.
  window.addEventListener('keydown', onEscape)

  // Wait for the dialog to render before focusing it.
  await nextTick()

  // Put the cursor on the close button.
  closeButton.value?.focus()
})

// Never leave the key listener behind.
onBeforeUnmount(() => {
  // Do not leave the key listener behind after unmount.
  window.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <div
    v-if="weaver.activeQrText"
    class="c-qr-backdrop"
    @click="weaver.closeQr()"
  >
    <div
      class="c-qr-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="weaver-qr-title"
      @click.stop
      @keydown.esc="weaver.closeQr()"
    >
      <h4
        id="weaver-qr-title"
        class="text-xl font-bold"
      >
        {{ $t('qr.title') }}
      </h4>
      <div class="c-qr-frame">
        <Qrcode
          :value="weaver.activeQrText"
          variant="pixelated"
          black-color="#000000"
          white-color="#ffffff"
          :width="250"
          :height="250"
        />
      </div>
      <p class="text-dimmed">
        {{ $t('qr.help') }}
      </p>
      <button
        ref="closeButton"
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
