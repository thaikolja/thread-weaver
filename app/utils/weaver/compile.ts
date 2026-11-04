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

/** Types for markers and finished posts. */
import type { CompiledPost, MarkerFormat, MarkerPlacement, WeaverState } from './types'

/**
 * The gap between text and marker when they sit on one line.
 * A bridge is wrapped in spaces. No bridge means one space.
 */
export function inlineJoiner(bridge: string): string {
  // Use the bridge with a space on each side, or a plain space when there is none.
  return bridge ? ` ${bridge} ` : ' '
}

/** The counter text itself, like `(1/3)` or `#2`. */
function markerLabel(format: Exclude<MarkerFormat, 'none'>, position: number, total: number): string {
  // Each format writes the same position and total in its own style.
  switch (format) {
    case 'parens':
      // Round brackets are the default look.
      return `(${position}/${total})`
    case 'brackets':
      // Square brackets for people who prefer them.
      return `[${position}/${total}]`
    case 'slash':
      // Just the fraction, no decoration.
      return `${position}/${total}`
    case 'hash':
      // Hash style only shows the current number.
      return `#${position}`
  }
}

/**
 * Stick the counter onto one chunk.
 * A bridge shows up right away for every placement, so typing "..." updates the card
 * without touching the source or the placement menu.
 * `none` skips the counter, so the bridge has nothing to sit next to.
 */
export function compileText(
  text: string,
  format: MarkerFormat,
  placement: MarkerPlacement,
  bridge: string,
  index: number,
  total: number
): string {
  /** No counter, so the raw chunk is the post. */
  if (format === 'none') {
    // Leave the text untouched when markers are off.
    return text
  }

  /** 1-based label for this card. */
  const marker = markerLabel(format, index + 1, total)

  /** Marker after the text, on the same line. */
  if (placement === 'inline-after') {
    // Text first, then the joiner and the counter.
    return `${text}${inlineJoiner(bridge)}${marker}`
  }

  /** Marker before the text, on the same line. */
  if (placement === 'inline-before') {
    // Counter first, then the joiner and the text.
    return `${marker}${inlineJoiner(bridge)}${text}`
  }

  /** Marker under the text. The bridge gets its own paragraph when it is set. */
  if (placement === 'newline') {
    // A bridge adds an extra paragraph between the text and the counter.
    return bridge ? `${text}\n\n${bridge}\n\n${marker}` : `${text}\n\n${marker}`
  }

  /** Marker above the text. Same idea for the bridge. */
  // The remaining placement starts with the counter and puts the text after it.
  return bridge ? `${marker}\n\n${bridge}\n\n${text}` : `${marker}\n\n${text}`
}

/**
 * The words Listen should read.
 * Same card as `compileText`, with the counter like `[1/2]` left off.
 * A bridge stays, because that text is part of the card.
 */
export function speakableText(
  text: string,
  format: MarkerFormat,
  placement: MarkerPlacement,
  bridge: string
): string {
  /** No counter to drop, or nothing left but the chunk once it is dropped. */
  if (format === 'none' || !bridge) {
    // Nothing extra was added, so the chunk alone is what gets read.
    return text
  }

  /** Bridge on the same line, after the chunk. */
  if (placement === 'inline-after') {
    // Keep the bridge after the text, but drop the counter.
    return `${text} ${bridge}`
  }

  /** Bridge on the same line, before the chunk. */
  if (placement === 'inline-before') {
    // Keep the bridge before the text, but drop the counter.
    return `${bridge} ${text}`
  }

  /** Bridge under the chunk. The counter used to follow it. */
  if (placement === 'newline') {
    // The bridge stays in its own paragraph under the text.
    return `${text}\n\n${bridge}`
  }

  /** Bridge above the chunk. The counter used to lead. */
  // The remaining placement keeps the bridge above the text.
  return `${bridge}\n\n${text}`
}

/**
 * Optional cleanup before the counter is attached.
 * Capitalize lifts the first letter. Finish sentences adds … when the chunk has no ending mark.
 */
export function polishSegment(text: string, capitalize: boolean, finishSentences: boolean): string {
  /** Nothing to clean. */
  if (!text) {
    // An empty chunk has no first letter and no sentence to close.
    return text
  }

  /** Working copy. */
  let next = text

  // Capitalize only when the editor asked for it.
  if (capitalize) {
    /** First visible character, so a leading break is left alone. */
    const index = next.search(/\S/)

    // A chunk with only whitespace has no letter to lift.
    if (index >= 0) {
      // Replace just that one character with its uppercase form.
      next = next.slice(0, index) + next.charAt(index).toUpperCase() + next.slice(index + 1)
    }
  }

  // Add the closing ellipsis only when the editor asked for it.
  if (finishSentences) {
    /** Ignore trailing space when deciding if the sentence is already closed. */
    const end = next.trimEnd()

    // Skip text that already ends with punctuation or three dots.
    if (end && !/[.!?…]$/.test(end) && !end.endsWith('...')) {
      // Append one ellipsis character to close the sentence.
      next = `${end}…`
    }
  }

  // Hand back the cleaned text.
  return next
}

/** Turn every chunk into a post, in the current order. */
export function compileThread(state: Pick<WeaverState, 'blocks' | 'marker' | 'placement' | 'bridge'> & Partial<Pick<WeaverState, 'capitalize' | 'finishSentences'>>): CompiledPost[] {
  /** How many cards, so the counter can say `1/n`. */
  const total = state.blocks.length

  /** Off unless the editor turned them on. */
  const capitalize = state.capitalize === true

  /** Same for the closing ellipsis. */
  const finishSentences = state.finishSentences === true

  // Map each chunk to its published, raw, and spoken forms.
  return state.blocks.map((block, index) => {
    /** Text the reader sees, before the counter. */
    const text = polishSegment(block.text, capitalize, finishSentences)

    // One record holds every version of this post.
    return {
      id:       block.id,
      raw:      text,
      compiled: compileText(text, state.marker, state.placement, state.bridge, index, total),
      spoken:   speakableText(text, state.marker, state.placement, state.bridge)
    }
  })
}
