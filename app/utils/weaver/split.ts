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

/** How many characters we save for the counter. */
import { MARKER_RESERVE } from './limits'

/** The shape of one packed chunk. */
import type { ThreadBlock } from './types'

/** A word plus the gap that should sit in front of it. */
interface Piece {
  text: string
  sepBefore: string
}

/**
 * Turn the source into words.
 * Normally the gap is a space, so line breaks disappear.
 * With keepBreaks, a new line stays a newline, and a blank line stays a blank line.
 */
function piecesFromSource(text: string, keepBreaks: boolean): Piece[] {
  /** One stream of words. Line breaks are just more whitespace. */
  if (!keepBreaks) {
    // Split on any whitespace and keep a space between the words.
    return text.split(/\s+/).filter(Boolean).map((word, index) => ({
      text: word,
      sepBefore: index === 0 ? '' : ' '
    }))
  }

  /** Words in reading order, with the real break kept in front of the next word. */
  const pieces: Piece[] = []

  /** Gap waiting for the next word. A blank line adds another newline. */
  let sep = ''

  // Walk the text one line at a time so the breaks can be preserved.
  for (const line of text.split('\n')) {
    /** Words on this line. Empty means the line was blank. */
    const words = line.trim().split(/\s+/).filter(Boolean)

    // A blank line becomes an extra newline in front of the next word.
    if (words.length === 0) {
      // Keep the previous gap and add another line break.
      sep = sep ? `${sep}\n` : '\n'

      // Nothing to add for this line, so move on.
      continue
    }

    // Add each word with the gap that belongs in front of it.
    for (const word of words) {
      // The first word has no gap; the rest use the pending separator.
      pieces.push({
        text: word,
        sepBefore: pieces.length === 0 ? '' : (sep || ' ')
      })

      // Later words on the same line are separated by a plain space.
      sep = ' '
    }

    /** The next line starts after a newline, not a space. */
    sep = '\n'
  }

  // Hand back the words in reading order.
  return pieces
}

/**
 * Fill chunks until the next word would pass the budget.
 * A word that is already too long is kept whole.
 */
function packPieces(pieces: readonly Piece[], budget: number): string[] {
  /** Finished chunks. */
  const blocks: string[] = []

  /** The chunk still being filled. */
  let current = ''

  // Try each word against the chunk that is still being filled.
  for (const piece of pieces) {
    /** This word, with its gap, stuck onto the current chunk. */
    const candidate = current ? `${current}${piece.sepBefore}${piece.text}` : piece.text

    /** Too long: save the chunk we have, unless this word is the whole chunk. */
    if (candidate.length > budget) {
      // Close the chunk before starting a new one with this word.
      if (current) {
        // Save the chunk that still fits.
        blocks.push(current)
      }

      // The over-long word becomes its own chunk.
      current = piece.text
    } else {
      // It still fits, so keep building this chunk.
      current = candidate
    }
  }

  /** Don't forget the last chunk. */
  if (current) {
    // The loop ended before this chunk was pushed.
    blocks.push(current)
  }

  // Every finished chunk, in order.
  return blocks
}

/**
 * Cut the source into chunks that fit the platform, minus room for the counter and the bridge.
 * A single word longer than that budget is kept whole. Empty input is one empty chunk.
 */
export function splitSource(source: string, limit: number, bridge: string, keepBreaks: boolean): ThreadBlock[] {
  /** Drop space around the edges. */
  const text = source.trim()

  /** No words, so show one empty card. */
  if (!text) {
    // Empty input still needs one card to render.
    return [{ id: 'b-0', text: '' }]
  }

  /** How long a raw chunk may be. */
  const budget = limit - (MARKER_RESERVE + bridge.length)

  /** Give each chunk an id based on its place after this pack. */
  return packPieces(piecesFromSource(text, keepBreaks), budget).map((block, index) => ({
    id: `block-${index}`,
    text: block
  }))
}
