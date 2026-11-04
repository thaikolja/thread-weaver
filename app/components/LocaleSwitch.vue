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
/** EN, DE, and ไทย. Each link opens that language's page. */
const { locale, locales } = useI18n()

/** Path for one locale, such as `/de`. */
const switchLocalePath = useSwitchLocalePath()

/** Short labels. Thai stays in its own script. */
const shortLabels: Record<string, string> = {
  en: 'EN',
  de: 'DE',
  th: 'TH'
}

/** One link per configured locale. */
const choices = computed(() => {
  // Build one link for every locale the app knows about.
  return locales.value.map((item) => {
    // A bare locale is just its code.
    const code = typeof item === 'string' ? item : item.code

    // The display name falls back to the code.
    const name = typeof item === 'string' ? item : item.name || code

    // The language tag falls back to the code too.
    const language = typeof item === 'string' ? item : item.language || code

    // Everything one NuxtLink needs.
    return {
      code,
      name,
      language,
      label: shortLabels[code] || code.toUpperCase(),
      to:    switchLocalePath(code) || '/'
    }
  })
})
</script>

<template>
  <nav
    class="c-locale"
    :aria-label="$t('locale.label')"
  >
    <NuxtLink
      v-for="choice in choices"
      :key="choice.code"
      :to="choice.to"
      class="c-locale-link"
      :class="locale === choice.code ? 'c-locale-on' : 'c-locale-off'"
      :aria-current="locale === choice.code ? 'page' : undefined"
      :aria-label="choice.language"
      :hreflang="choice.language"
      :lang="choice.language"
    >
      {{ choice.label }}
    </NuxtLink>
  </nav>
</template>

<style scoped>
@reference "../assets/css/main.css";

.c-locale {
  @apply flex shrink-0 items-center gap-1;
}

.c-locale-link {
  @apply rounded-full border border-slate-200/90 bg-white px-2 py-1 font-mono text-xs font-semibold tracking-wide text-slate-500;
  transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease;
}

.c-locale-off {
  @apply hover:border-slate-300 hover:text-slate-900;
}

.c-locale-on {
  @apply border-slate-950 bg-slate-950 text-white;
}

@media (prefers-reduced-motion: reduce) {
  .c-locale-link {
    transition: none;
  }
}
</style>
