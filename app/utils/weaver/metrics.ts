/** A finished post, so we can measure what people will actually publish. */
import type { CompiledPost } from './types'

/** Add up the published length, markers and bridges included. */
export function totalChars(posts: readonly CompiledPost[]): number {
  return posts.reduce((sum, post) => sum + post.compiled.length, 0)
}

/** Count words in the source box. Markers and bridges are not words. */
export function totalWords(source: string): number {
  /** Ignore space around the edges. */
  const trimmed = source.trim()

  /** An empty box is zero words, not one empty word. */
  if (!trimmed) {
    return 0
  }

  return trimmed.split(/\s+/).length
}

/** Rough read time. At least a minute, otherwise about 200 words a minute. */
export function readTimeMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200))
}

/**
 * Color for the little ring.
 * Over the limit is a hard red. Under it, the hue slides from green toward red.
 */
export function ringColor(currentLen: number, maxLimit: number): string {
  /** Keep the ratio between 0 and 1 so the hue stays in range. */
  const ratio = Math.min(1, Math.max(0, currentLen / maxLimit))

  /** Too long. Don't pretend it still fits. */
  if (currentLen > maxLimit) {
    return 'hsl(0, 90%, 45%)'
  }

  /** 140 is green. 0 is red. */
  const hue = (1 - ratio) * 140

  return `hsl(${hue}, 80%, 42%)`
}

/**
 * Count beside the ring.
 * Same hue as the stroke, at 26% so yellow-green still clears on white.
 */
export function ringTextColor(currentLen: number, maxLimit: number): string {
  /** Keep the ratio between 0 and 1 so the hue stays in range. */
  const ratio = Math.min(1, Math.max(0, currentLen / maxLimit))

  /** The over-limit red already clears. */
  if (currentLen > maxLimit) {
    return 'hsl(0, 90%, 45%)'
  }

  /** 140 is green. 0 is red. */
  const hue = (1 - ratio) * 140

  return `hsl(${hue}, 80%, 26%)`
}

/** How far around the ring the stroke should stop. 0 is a full circle. */
export function ringDashOffset(length: number, limit: number): number {
  return 100 - Math.min(100, (length / limit) * 100)
}
