/**
 * Shared names for the editor.
 * No Vue and no browser APIs in this folder.
 */

/** Character caps for the four platforms. */
export const PLATFORM_LIMITS = {
  x: 280,
  bsky: 300,
  threads: 500,
  masto: 500
} as const

/** Which corset is selected. The numbers live on PLATFORM_LIMITS. */
export type PlatformId = keyof typeof PLATFORM_LIMITS

/** How the little counter is written. `none` leaves the raw text alone. */
export type MarkerFormat = 'parens' | 'brackets' | 'slash' | 'hash' | 'none'

/** Where that counter sits on the post. */
export type MarkerPlacement = 'newline' | 'inline-after' | 'inline-before' | 'start'

/** One chunk of text before the counter is added. */
export interface ThreadBlock {
  id: string
  text: string
}

/** One post ready to copy, speak, or send. */
export interface CompiledPost {
  id: string
  raw: string
  compiled: string
}

/** Everything the editor is holding onto. `blocks` is the current order. */
export interface WeaverState {
  source: string
  platform: PlatformId
  limit: number
  marker: MarkerFormat
  placement: MarkerPlacement
  bridge: string
  capitalize: boolean
  finishSentences: boolean
  keepBreaks: boolean
  blocks: ThreadBlock[]
}

/** What the Listen button should do for this click. */
export type SpeechCommand
  = | { type: 'noop' }
    | { type: 'cancel' }
    | { type: 'speak', text: string, rate: number }
