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

/** The start of each platform's compose link. */
import { intentPrefix } from './limits'

/** Post and platform types. */
import type { CompiledPost, PlatformId } from './types'

/** All posts, separated the way "Copy Entire Sequence" pastes them. */
export function copyAllBody(posts: readonly CompiledPost[]): string {
  // Glue the posts together with the same divider the page shows.
  return posts.map(post => post.compiled).join('\n\n---\n\n')
}

/**
 * A markdown file: a heading per post, same separators as copy-all.
 * The heading defaults to `Post 1`. The page passes the locale's word.
 */
export function markdownBody(
  posts: readonly CompiledPost[],
  heading: (index: number) => string = index => `Post ${index}`
): string {
  // One heading per post, with the shared divider between sections.
  return posts.map((post, index) => `### ${heading(index + 1)}\n\n${post.compiled}`).join('\n\n---\n\n')
}

/** File name like `thread-x-1710000000000.md`. */
export function markdownFilename(platform: PlatformId, timestamp: number): string {
  // The timestamp keeps downloads from overwriting each other.
  return `thread-${platform}-${timestamp}.md`
}

/** Compose link with the post already encoded. */
export function intentUrl(platform: PlatformId, compiled: string): string {
  // Encode the post so line breaks and symbols survive the query string.
  return `${intentPrefix(platform)}${encodeURIComponent(compiled)}`
}
