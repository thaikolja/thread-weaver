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

/** Platform id, so the maps stay typed. */
import type { PlatformId } from './types'

/** The sentence in the box after a reload. */
export const SAMPLE_SOURCE = 'Segment 1 of your unhinged monologue sits right here. Start typing or pasting above, and the engine partitions your thoughts along word boundaries before the platform limits humiliate you.'

/** How long "All Copied!" stays on screen, in milliseconds. */
export const COPY_ALL_RESET_MS = 2500

/** How fast Listen talks. 1 is normal. */
export const SPEECH_RATE = 1.05

/** Room we leave for a counter like `(999/999)` before the bridge length is added. */
export const MARKER_RESERVE = 16

/** Short names. The page shows the same words from the locale files. */
const PLATFORM_NAMES: Record<PlatformId, string> = {
  x: 'X',
  bsky: 'Bluesky',
  threads: 'Threads',
  masto: 'Mastodon'
}

/** Where "Send" opens, before the encoded post is stuck on the end. */
const INTENT_PREFIX: Record<PlatformId, string> = {
  x: 'https://x.com/intent/tweet?text=',
  bsky: 'https://bsky.app/intent/compose?text=',
  threads: 'https://www.threads.net/intent/post?text=',
  masto: 'https://mastodon.social/share?text='
}

/** The name people see for the active platform. */
export function platformLabel(platform: PlatformId): string {
  // Look up the short name people see on the page.
  return PLATFORM_NAMES[platform]
}

/** The start of the compose link for that platform. */
export function intentPrefix(platform: PlatformId): string {
  // Look up where that platform expects a new post.
  return INTENT_PREFIX[platform]
}
