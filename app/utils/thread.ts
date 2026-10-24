/**
 * Pure Thread Weaver rules ported from `template.html`.
 * No Vue, Nuxt, or browser APIs. The page and `useThreadWeaver` call these functions.
 */

export const SAMPLE_SOURCE = 'Segment 1 of your unhinged monologue sits right here. Start typing or pasting above, and the engine partitions your thoughts along word boundaries before the platform limits humiliate you.'

/** How long the "copied entire sequence" flag stays on, in milliseconds. */
export const COPY_ALL_RESET_MS = 2500

/** `SpeechSynthesisUtterance.rate` used by Listen. */
export const SPEECH_RATE = 1.05

/** Characters reserved for a marker, before the custom bridge length is added. */
export const MARKER_RESERVE = 16

export const PLATFORM_LIMITS = {
  x: 280,
  bsky: 300,
  threads: 500,
  masto: 500
} as const

export type PlatformId = keyof typeof PLATFORM_LIMITS

export type MarkerFormat = 'parens' | 'brackets' | 'slash' | 'hash' | 'none'

export type MarkerPlacement = 'newline' | 'inline-after' | 'inline-before' | 'start'

export interface ThreadBlock {
  id: string
  text: string
}

export interface CompiledPost {
  id: string
  raw: string
  compiled: string
}

export interface WeaverState {
  source: string
  platform: PlatformId
  limit: number
  marker: MarkerFormat
  placement: MarkerPlacement
  bridge: string
  flatten: boolean
  blocks: ThreadBlock[]
}

export type SpeechCommand
  = | { type: 'noop' }
    | { type: 'cancel' }
    | { type: 'speak', text: string, rate: number }

const PLATFORM_NAMES: Record<PlatformId, string> = {
  x: 'X',
  bsky: 'Bluesky',
  threads: 'Threads',
  masto: 'Mastodon'
}

const INTENT_PREFIX: Record<PlatformId, string> = {
  x: 'https://x.com/intent/tweet?text=',
  bsky: 'https://bsky.app/intent/compose?text=',
  threads: 'https://www.threads.net/intent/post?text=',
  masto: 'https://mastodon.social/share?text='
}

/** Visible platform name for the active corset. */
export function platformLabel(platform: PlatformId): string {
  return PLATFORM_NAMES[platform]
}

/**
 * Trim `source`. When `flatten` is set, collapse blank lines and runs of spaces or tabs
 * before the packer splits on whitespace.
 */
export function prepareSource(source: string, flatten: boolean): string {
  const trimmed = source.trim()
  if (!trimmed || !flatten) {
    return trimmed
  }
  return trimmed.replace(/\n\s*\n/g, '\n').replace(/[ \t]+/g, ' ')
}

/**
 * Pack `source` into raw segments.
 * Each segment's length stays within `limit - (16 + bridge.length)`, except a single token
 * longer than that budget, which is kept whole. Empty input yields one empty segment.
 */
export function splitSource(source: string, limit: number, bridge: string, flatten: boolean): ThreadBlock[] {
  const text = prepareSource(source, flatten)
  if (!text) {
    return [{ id: 'b-0', text: '' }]
  }

  const words = text.split(/\s+/)
  const blocks: string[] = []
  let current = ''
  const budget = limit - (MARKER_RESERVE + bridge.length)

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > budget) {
      if (current) {
        blocks.push(current)
      }
      current = word
    } else {
      current = candidate
    }
  }
  if (current) {
    blocks.push(current)
  }

  return blocks.map((block, index) => ({
    id: `block-${index}`,
    text: block
  }))
}

function markerLabel(format: Exclude<MarkerFormat, 'none'>, position: number, total: number): string {
  switch (format) {
    case 'parens':
      return `(${position}/${total})`
    case 'brackets':
      return `[${position}/${total}]`
    case 'slash':
      return `${position}/${total}`
    case 'hash':
      return `#${position}`
  }
}

/**
 * Attach the marker for `index` (0-based) to `text`.
 * `none` returns `text` unchanged. Inline placement joins with ` ${bridge} ` or a single space.
 */
export function compileText(
  text: string,
  format: MarkerFormat,
  placement: MarkerPlacement,
  bridge: string,
  index: number,
  total: number
): string {
  if (format === 'none') {
    return text
  }

  const position = index + 1
  const marker = markerLabel(format, position, total)

  const delimiter = bridge ? ` ${bridge} ` : ' '
  if (placement === 'newline') {
    return `${text}\n\n${marker}`
  }
  if (placement === 'inline-after') {
    return `${text}${delimiter}${marker}`
  }
  if (placement === 'inline-before') {
    return `${marker}${delimiter}${text}`
  }
  return `${marker}\n\n${text}`
}

/** Compile every block with the state's marker, placement, and bridge. */
export function compileThread(state: Pick<WeaverState, 'blocks' | 'marker' | 'placement' | 'bridge'>): CompiledPost[] {
  const total = state.blocks.length
  return state.blocks.map((block, index) => ({
    id: block.id,
    raw: block.text,
    compiled: compileText(block.text, state.marker, state.placement, state.bridge, index, total)
  }))
}

function resplit(state: WeaverState): WeaverState {
  return {
    ...state,
    blocks: splitSource(state.source, state.limit, state.bridge, state.flatten)
  }
}

/** Defaults: X / 280, parentheses, newline, empty bridge, flatten off, sample sentence. */
export function createWeaverState(source: string = SAMPLE_SOURCE): WeaverState {
  return resplit({
    source,
    platform: 'x',
    limit: PLATFORM_LIMITS.x,
    marker: 'parens',
    placement: 'newline',
    bridge: '',
    flatten: false,
    blocks: []
  })
}

/** Replace the source and pack again, discarding manual order. */
export function setSource(state: WeaverState, source: string): WeaverState {
  return resplit({ ...state, source })
}

/** Toggle blank-line flattening and pack again. */
export function setFlatten(state: WeaverState, flatten: boolean): WeaverState {
  return resplit({ ...state, flatten })
}

/** Switch platform, apply its limit, and pack again. */
export function setPlatform(state: WeaverState, platform: PlatformId): WeaverState {
  return resplit({
    ...state,
    platform,
    limit: PLATFORM_LIMITS[platform]
  })
}

/**
 * Update the bridge.
 * A length change packs again. The same length keeps the current segment order.
 */
export function setBridge(state: WeaverState, bridge: string): WeaverState {
  const next = { ...state, bridge }
  if (bridge.length !== state.bridge.length) {
    return resplit(next)
  }
  return next
}

/** Change marker style without packing again. */
export function setMarker(state: WeaverState, marker: MarkerFormat): WeaverState {
  return { ...state, marker }
}

/** Change marker placement without packing again. */
export function setPlacement(state: WeaverState, placement: MarkerPlacement): WeaverState {
  return { ...state, placement }
}

/** Move the segment at `index` by `delta` positions. Out of range is a no-op. */
export function moveSegment(state: WeaverState, index: number, delta: number): WeaverState {
  const newIndex = index + delta
  if (newIndex < 0 || newIndex >= state.blocks.length) {
    return state
  }
  const blocks = state.blocks.slice()
  const item = blocks.splice(index, 1)[0]
  if (!item) {
    return state
  }
  blocks.splice(newIndex, 0, item)
  return { ...state, blocks }
}

/** Remove the segment at `index` without reflowing the others. */
export function dropSegment(state: WeaverState, index: number): WeaverState {
  if (index < 0 || index >= state.blocks.length) {
    return state
  }
  const blocks = state.blocks.slice()
  blocks.splice(index, 1)
  return { ...state, blocks }
}

/** Sum of compiled post lengths. */
export function totalChars(posts: readonly CompiledPost[]): number {
  return posts.reduce((sum, post) => sum + post.compiled.length, 0)
}

/** Word count of the trimmed source. Empty source is 0. */
export function totalWords(source: string): number {
  const trimmed = source.trim()
  if (!trimmed) {
    return 0
  }
  return trimmed.split(/\s+/).length
}

/** Estimated read time in minutes: at least 1, otherwise `round(words / 200)`. */
export function readTimeMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200))
}

/**
 * Length-ring stroke color.
 * Over the limit is `hsl(0, 90%, 45%)`. Otherwise hue falls from 140 toward 0 as the ratio grows.
 */
export function ringColor(currentLen: number, maxLimit: number): string {
  const ratio = Math.min(1, Math.max(0, currentLen / maxLimit))
  if (currentLen > maxLimit) {
    return 'hsl(0, 90%, 45%)'
  }
  const hue = (1 - ratio) * 140
  return `hsl(${hue}, 80%, 42%)`
}

/** SVG stroke-dashoffset for a 100-unit ring, clamped so the arc never exceeds a full circle. */
export function ringDashOffset(length: number, limit: number): number {
  return 100 - Math.min(100, (length / limit) * 100)
}

/** Compiled posts joined for "Copy Entire Sequence". */
export function copyAllBody(posts: readonly CompiledPost[]): string {
  return posts.map(post => post.compiled).join('\n\n---\n\n')
}

/** Markdown download body: `### Post N` sections joined by a horizontal rule. */
export function markdownBody(posts: readonly CompiledPost[]): string {
  return posts.map((post, index) => `### Post ${index + 1}\n\n${post.compiled}`).join('\n\n---\n\n')
}

/** Download filename `thread-<platform>-<timestamp>.md`. */
export function markdownFilename(platform: PlatformId, timestamp: number): string {
  return `thread-${platform}-${timestamp}.md`
}

/** Compose-intent URL for the active platform, with `compiled` percent-encoded. */
export function intentUrl(platform: PlatformId, compiled: string): string {
  return `${INTENT_PREFIX[platform]}${encodeURIComponent(compiled)}`
}

/** Remote QR image URL whose data is the compiled post. */
export function qrImageUrl(compiled: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(compiled)}`
}

/**
 * Next Listen action.
 * Missing API is a no-op. Speaking the same post cancels. Otherwise speak `text` at {@link SPEECH_RATE}.
 */
export function speechCommand(
  apiAvailable: boolean,
  currentId: string | null,
  postId: string,
  text: string,
  isSpeaking: boolean
): SpeechCommand {
  if (!apiAvailable) {
    return { type: 'noop' }
  }
  if (isSpeaking && currentId === postId) {
    return { type: 'cancel' }
  }
  return { type: 'speak', text, rate: SPEECH_RATE }
}

/**
 * Mark the sequence copied, then schedule the flag to clear after {@link COPY_ALL_RESET_MS}.
 * `schedule` is injected so the page can pass `setTimeout` and tests can capture the delay.
 */
export function armCopyAllReset(
  mark: (copied: boolean) => void,
  schedule: (fn: () => void, ms: number) => void
): void {
  mark(true)
  schedule(() => {
    mark(false)
  }, COPY_ALL_RESET_MS)
}
