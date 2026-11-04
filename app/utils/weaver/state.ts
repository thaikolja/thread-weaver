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

/** Character caps, including the default 280 for X. */
import { PLATFORM_LIMITS } from './types'

/** Text we show before the user types. */
import { SAMPLE_SOURCE } from './limits'

/** The packer that builds a fresh list of chunks. */
import { splitSource } from './split'

/** Editor fields. */
import type { MarkerFormat, MarkerPlacement, PlatformId, WeaverState } from './types'

/** Pack again from the source and replace the chunk list. */
function resplit(state: WeaverState): WeaverState {
  // Keep every field, but swap in a fresh set of chunks.
  return {
    ...state,
    blocks: splitSource(state.source, state.limit, state.bridge, state.keepBreaks)
  }
}

/** A fresh editor: X, parentheses, marker on its own line, no bridge. */
export function createWeaverState(source: string = SAMPLE_SOURCE): WeaverState {
  // Start from the defaults, then let the packer fill in the blocks.
  return resplit({
    source,
    platform: 'x',
    limit: PLATFORM_LIMITS.x,
    marker: 'parens',
    placement: 'newline',
    bridge: '',
    capitalize: false,
    finishSentences: false,
    keepBreaks: false,
    blocks: []
  })
}

/** New source text. Manual order is dropped because we pack from scratch. */
export function setSource(state: WeaverState, source: string): WeaverState {
  // A new source always means a fresh pack.
  return resplit({ ...state, source })
}

/** Capitalize the first letter of each post. The chunks stay where they are. */
export function setCapitalize(state: WeaverState, capitalize: boolean): WeaverState {
  // Only the flag changes, so the chunks stay put.
  return { ...state, capitalize }
}

/** Add … to a post that does not already end a sentence. Does not repack. */
export function setFinishSentences(state: WeaverState, finishSentences: boolean): WeaverState {
  // The closing ellipsis is applied later, not by repacking.
  return { ...state, finishSentences }
}

/** Keep line breaks in the posts and pack again. Manual order is dropped. */
export function setKeepBreaks(state: WeaverState, keepBreaks: boolean): WeaverState {
  // Line breaks change the chunk boundaries, so pack again.
  return resplit({ ...state, keepBreaks })
}

/** Switch platform and use that platform's limit. The bridge stays. */
export function setPlatform(state: WeaverState, platform: PlatformId): WeaverState {
  // The new platform brings its own limit and a fresh pack.
  return resplit({
    ...state,
    platform,
    limit: PLATFORM_LIMITS[platform]
  })
}

/**
 * Change the bridge.
 * A longer or shorter bridge changes the budget, so we pack again.
 * The same length keeps the current order and still shows the new characters.
 */
export function setBridge(state: WeaverState, bridge: string): WeaverState {
  /** Copy the state with the new bridge text. */
  const next = { ...state, bridge }

  /** Budget changed, so the old chunks may not fit anymore. */
  if (bridge.length !== state.bridge.length) {
    // Repack because the room for words just changed.
    return resplit(next)
  }

  // Same length keeps the manual order, but the new bridge still renders.
  return next
}

/** Swap the counter style. The chunks stay where they are. */
export function setMarker(state: WeaverState, marker: MarkerFormat): WeaverState {
  // The counter style does not affect the chunks.
  return { ...state, marker }
}

/** Move the counter. Still no repack. */
export function setPlacement(state: WeaverState, placement: MarkerPlacement): WeaverState {
  // Moving the counter does not repack either.
  return { ...state, placement }
}

/**
 * Slide one chunk up or down.
 * Going past either end returns the same state, so nothing else resets.
 */
export function moveSegment(state: WeaverState, index: number, delta: number): WeaverState {
  /** Where it wants to land. */
  const newIndex = index + delta

  /** Already at the end of the list. */
  if (newIndex < 0 || newIndex >= state.blocks.length) {
    // Nothing to move to, so leave the state untouched.
    return state
  }

  /** A copy we can reorder. */
  const blocks = state.blocks.slice()

  /** Pull the chunk out. */
  const item = blocks.splice(index, 1)[0]

  /** Nothing there. Shouldn't happen, but don't crash. */
  if (!item) {
    // A missing chunk means the index was stale.
    return state
  }

  /** Drop it back in the new spot. */
  blocks.splice(newIndex, 0, item)

  // Hand back the same state with the reordered list.
  return { ...state, blocks }
}

/** Delete one chunk. The others keep their text. They are not glued back together. */
export function dropSegment(state: WeaverState, index: number): WeaverState {
  /** No such card. */
  if (index < 0 || index >= state.blocks.length) {
    // Nothing matches, so do not change anything.
    return state
  }

  /** Copy, then remove just that index. */
  const blocks = state.blocks.slice()

  // Remove the one chunk the caller asked for.
  blocks.splice(index, 1)

  // The remaining chunks keep their text; they are not glued back together.
  return { ...state, blocks }
}
