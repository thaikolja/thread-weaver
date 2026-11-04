/*
 * Thread Weaver
 *
 * @description     Online tool to split long messages into parts for character-limited platforms
 * @author          Kolja Nolte <kolja.nolte@gmail.com>
 * @copyright       2026 (C) Kolja Nolte
 * @see             https://www.kolja-nolte.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * @package Thread Weaver
 */

/** Vue helpers. Refs stay explicit so this file is easy to follow. */
import { computed, ref } from 'vue'

/** Turns chunks into the text on the cards. */
import { compileThread } from '~/utils/weaver/compile'

/** Character total, word count, and read time. */
import { readTimeMinutes, totalChars, totalWords } from '~/utils/weaver/metrics'

/** The pure edits: source, bridge, move, drop, and so on. */
import {
  createWeaverState,
  dropSegment,
  moveSegment,
  setBridge,
  setCapitalize,
  setFinishSentences,
  setKeepBreaks,
  setMarker,
  setPlacement,
  setPlatform,
  setSource
} from '~/utils/weaver/state'

/** Field types. */
import type { MarkerFormat, MarkerPlacement, PlatformId, WeaverState } from '~/utils/weaver/types'

/**
 * The editable draft.
 * Every control, including the bridge box, goes through `commit`, so the cards update immediately.
 *
 * @param onChange Runs after a real edit. Use it to clear copy ticks, stop speech, and close the QR.
 */
export function useWeaverDraft(onChange: () => void) {
  /** The active locale's copy. */
  const { t } = useI18n()

  /** Starts on the English sample, then swaps in a translation. */
  const weaver = ref(createWeaverState())

  /** The translated sample. English matches the packer constant, so it stays. */
  const sample = t('source.sample')

  /** Other locales open on their own sentence. */
  if (sample !== weaver.value.source) {
    // Swap the English sample for the translated one.
    weaver.value = setSource(weaver.value, sample)
  }

  /**
   * Save the next state and tell the page something changed.
   * A move that hits the end returns the same object, and we ignore that.
   */
  function commit(next: WeaverState): void {
    /** Nothing moved. */
    if (next === weaver.value) {
      // No change, so skip the callback and the extra work.
      return
    }

    /** Swap in the new state. */
    weaver.value = next

    /** Copy flags and speech would otherwise stick to reused ids. */
    onChange()
  }

  /** The textarea. Writing it packs the text again. */
  const source = computed({
    get: () => weaver.value.source,
    set: (value: string) => {
      // A source edit packs the text again.
      commit(setSource(weaver.value, value))
    }
  })

  /** Parentheses, brackets, fraction, hash, or none. */
  const marker = computed({
    get: () => weaver.value.marker,
    set: (value: MarkerFormat) => {
      // Swap the counter style without repacking.
      commit(setMarker(weaver.value, value))
    }
  })

  /** Where the counter sits. */
  const placement = computed({
    get: () => weaver.value.placement,
    set: (value: MarkerPlacement) => {
      // Move the counter without repacking.
      commit(setPlacement(weaver.value, value))
    }
  })

  /** The custom bridge. Each keystroke updates the cards. */
  const bridge = computed({
    get: () => weaver.value.bridge,
    set: (value: string) => {
      // Update the bridge; a length change repacks inside setBridge.
      commit(setBridge(weaver.value, value))
    }
  })

  /** First letter of each post. Does not repack. */
  const capitalize = computed({
    get: () => weaver.value.capitalize,
    set: (value: boolean) => {
      // Toggle capitalization without repacking.
      commit(setCapitalize(weaver.value, value))
    }
  })

  /** Adds … when a post does not already end a sentence. */
  const finishSentences = computed({
    get: () => weaver.value.finishSentences,
    set: (value: boolean) => {
      // Toggle the closing ellipsis without repacking.
      commit(setFinishSentences(weaver.value, value))
    }
  })

  /** Keep newlines instead of turning them into spaces. Packs again. */
  const keepBreaks = computed({
    get: () => weaver.value.keepBreaks,
    set: (value: boolean) => {
      // Line breaks change the packing, so this one repacks.
      commit(setKeepBreaks(weaver.value, value))
    }
  })

  /** Active corset. */
  const platform = computed(() => weaver.value.platform)

  /** That corset's character cap. */
  const limit = computed(() => weaver.value.limit)

  /** Cards, already with counters and the bridge. */
  const posts = computed(() => compileThread(weaver.value))

  /** A blank box still packs b-0. The page does not show that empty card. */
  const shownPosts = computed(() => weaver.value.source.trim() ? posts.value : [])

  /** Published length of every card added together. */
  const totalCharacterCount = computed(() => totalChars(posts.value))

  /** Words in the textarea, not in the counters. */
  const wordCount = computed(() => totalWords(weaver.value.source))

  /** At least one minute. */
  const readMinutes = computed(() => readTimeMinutes(wordCount.value))

  /** "X" or "Bluesky", from the active locale. */
  const platformName = computed(() => t(`platform.name.${platform.value}`))

  /** Pick a platform and pack to its limit. */
  function choosePlatform(next: PlatformId): void {
    // Save the new platform and let it repack.
    commit(setPlatform(weaver.value, next))
  }

  /** Nudge one card up or down. */
  function move(index: number, delta: number): void {
    // Reorder the chunks without touching their text.
    commit(moveSegment(weaver.value, index, delta))
  }

  /** Throw one card away. */
  function drop(index: number): void {
    // Remove the chunk at this position.
    commit(dropSegment(weaver.value, index))
  }

  // Everything the page and the sections read.
  return {
    source,
    marker,
    placement,
    bridge,
    capitalize,
    finishSentences,
    keepBreaks,
    platform,
    limit,
    posts,
    shownPosts,
    totalCharacterCount,
    wordCount,
    readMinutes,
    platformName,
    choosePlatform,
    move,
    drop
  }
}
