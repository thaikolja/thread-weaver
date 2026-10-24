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
/** The compiled post these buttons act on. */

import type { CompiledPost } from '~/utils/weaver/types'

defineProps<{
  post: CompiledPost
  index: number
}>()

/** Shared editor. */

const weaver = useWeaver()
</script>

<template>
  <div class="c-actions">
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="c-send"
        :title="$t('actions.sendTitle')"
        @click="weaver.send(post.compiled)"
      >
        <UIcon
          name="i-lucide-external-link"
          class="c-action-icon"
        />
        <span>{{ $t('actions.send', { platform: weaver.platformName }) }}</span>
      </button>
      <button
        type="button"
        class="c-listen"
        :class="weaver.speakingId === post.id ? 'c-listen-on' : 'c-listen-off'"
        :title="$t('actions.listenTitle')"
        @click="weaver.listen(post.spoken, post.id)"
      >
        <UIcon
          name="i-lucide-volume-2"
          class="size-3.5"
        />
        <span>{{ weaver.speakingId === post.id ? $t('actions.speaking') : $t('actions.listen') }}</span>
      </button>
      <button
        type="button"
        class="c-phone"
        :title="$t('actions.qrTitle')"
        @click="weaver.openQr(post.compiled)"
      >
        <UIcon
          name="i-lucide-qr-code"
          class="c-action-icon"
        />
        <span>{{ $t('actions.qr') }}</span>
      </button>
    </div>
    <button
      type="button"
      class="c-drop"
      @click="weaver.drop(index)"
    >
      <UIcon
        name="i-lucide-trash-2"
        class="size-3.5"
      />
      <span>{{ $t('actions.drop') }}</span>
    </button>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-actions {
  @apply flex flex-wrap items-center justify-between gap-2 pt-1 text-xs;
}

.c-send {
  @apply btn-tactile flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-200;
}

.c-action-icon {
  @apply size-3.5 text-slate-500;
}

.c-listen {
  @apply btn-tactile flex items-center gap-1.5 rounded-xl px-2.5 py-1 font-medium transition;
}

.c-listen-on {
  @apply border border-amber-200 bg-amber-100 text-amber-900;
}

.c-listen-off {
  @apply bg-slate-100 text-slate-600 hover:bg-slate-200;
}

.c-phone {
  @apply btn-tactile flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-200;
}

.c-drop {
  @apply btn-tactile flex items-center gap-1 p-1 font-semibold text-slate-600 hover:text-red-500;
}
</style>
