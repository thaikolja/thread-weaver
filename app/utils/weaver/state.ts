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
  return {
    ...state,
    blocks: splitSource(state.source, state.limit, state.bridge, state.keepBreaks)
  }
}

/** A fresh editor: X, parentheses, marker on its own line, no bridge. */
export function createWeaverState(source: string = SAMPLE_SOURCE): WeaverState {
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
  return resplit({ ...state, source })
}

/** Capitalize the first letter of each post. The chunks stay where they are. */
export function setCapitalize(state: WeaverState, capitalize: boolean): WeaverState {
  return { ...state, capitalize }
}

/** Add … to a post that does not already end a sentence. Does not repack. */
export function setFinishSentences(state: WeaverState, finishSentences: boolean): WeaverState {
  return { ...state, finishSentences }
}

/** Keep line breaks in the posts and pack again. Manual order is dropped. */
export function setKeepBreaks(state: WeaverState, keepBreaks: boolean): WeaverState {
  return resplit({ ...state, keepBreaks })
}

/** Switch platform and use that platform's limit. The bridge stays. */
export function setPlatform(state: WeaverState, platform: PlatformId): WeaverState {
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
    return resplit(next)
  }

  return next
}

/** Swap the counter style. The chunks stay where they are. */
export function setMarker(state: WeaverState, marker: MarkerFormat): WeaverState {
  return { ...state, marker }
}

/** Move the counter. Still no repack. */
export function setPlacement(state: WeaverState, placement: MarkerPlacement): WeaverState {
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
    return state
  }

  /** A copy we can reorder. */
  const blocks = state.blocks.slice()

  /** Pull the chunk out. */
  const item = blocks.splice(index, 1)[0]

  /** Nothing there. Shouldn't happen, but don't crash. */
  if (!item) {
    return state
  }

  /** Drop it back in the new spot. */
  blocks.splice(newIndex, 0, item)

  return { ...state, blocks }
}

/** Delete one chunk. The others keep their text. They are not glued back together. */
export function dropSegment(state: WeaverState, index: number): WeaverState {
  /** No such card. */
  if (index < 0 || index >= state.blocks.length) {
    return state
  }

  /** Copy, then remove just that index. */
  const blocks = state.blocks.slice()

  blocks.splice(index, 1)

  return { ...state, blocks }
}
