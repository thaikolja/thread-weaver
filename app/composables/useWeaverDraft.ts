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

/** "X", "Bluesky", and the rest. */
import { platformLabel } from '~/utils/weaver/limits'

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
  /** Starts on the sample sentence. */
  const weaver = ref(createWeaverState())

  /**
   * Save the next state and tell the page something changed.
   * A move that hits the end returns the same object, and we ignore that.
   */
  function commit(next: WeaverState): void {
    /** Nothing moved. */
    if (next === weaver.value) {
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
      commit(setSource(weaver.value, value))
    }
  })

  /** Parentheses, brackets, fraction, hash, or none. */
  const marker = computed({
    get: () => weaver.value.marker,
    set: (value: MarkerFormat) => {
      commit(setMarker(weaver.value, value))
    }
  })

  /** Where the counter sits. */
  const placement = computed({
    get: () => weaver.value.placement,
    set: (value: MarkerPlacement) => {
      commit(setPlacement(weaver.value, value))
    }
  })

  /** The custom bridge. Each keystroke updates the cards. */
  const bridge = computed({
    get: () => weaver.value.bridge,
    set: (value: string) => {
      commit(setBridge(weaver.value, value))
    }
  })

  /** First letter of each post. Does not repack. */
  const capitalize = computed({
    get: () => weaver.value.capitalize,
    set: (value: boolean) => {
      commit(setCapitalize(weaver.value, value))
    }
  })

  /** Adds … when a post does not already end a sentence. */
  const finishSentences = computed({
    get: () => weaver.value.finishSentences,
    set: (value: boolean) => {
      commit(setFinishSentences(weaver.value, value))
    }
  })

  /** Keep newlines instead of turning them into spaces. Packs again. */
  const keepBreaks = computed({
    get: () => weaver.value.keepBreaks,
    set: (value: boolean) => {
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

  /** "X" or "Bluesky", for the buttons. */
  const platformName = computed(() => platformLabel(platform.value))

  /** Pick a platform and pack to its limit. */
  function choosePlatform(next: PlatformId): void {
    commit(setPlatform(weaver.value, next))
  }

  /** Nudge one card up or down. */
  function move(index: number, delta: number): void {
    commit(moveSegment(weaver.value, index, delta))
  }

  /** Throw one card away. */
  function drop(index: number): void {
    commit(dropSegment(weaver.value, index))
  }

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
