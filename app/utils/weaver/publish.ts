/** The start of each platform's compose link. */
import { intentPrefix } from './limits'

/** Post and platform types. */
import type { CompiledPost, PlatformId } from './types'

/** All posts, separated the way "Copy Entire Sequence" pastes them. */
export function copyAllBody(posts: readonly CompiledPost[]): string {
  return posts.map(post => post.compiled).join('\n\n---\n\n')
}

/** A markdown file: a heading per post, same separators as copy-all. */
export function markdownBody(posts: readonly CompiledPost[]): string {
  return posts.map((post, index) => `### Post ${index + 1}\n\n${post.compiled}`).join('\n\n---\n\n')
}

/** File name like `thread-x-1710000000000.md`. */
export function markdownFilename(platform: PlatformId, timestamp: number): string {
  return `thread-${platform}-${timestamp}.md`
}

/** Compose link with the post already encoded. */
export function intentUrl(platform: PlatformId, compiled: string): string {
  return `${intentPrefix(platform)}${encodeURIComponent(compiled)}`
}

/** Image address for the phone QR. The image itself is still remote. */
export function qrImageUrl(compiled: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(compiled)}`
}
