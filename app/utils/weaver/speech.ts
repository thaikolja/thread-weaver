/** How long the copy-all flag lasts, and how fast speech talks. */
import { COPY_ALL_RESET_MS, SPEECH_RATE } from './limits'

/** The three things Listen can decide to do. */
import type { SpeechCommand } from './types'

/**
 * Decide the next Listen click.
 * No speech API means do nothing. The same post already talking means stop.
 * Anything else means start that post at the usual rate.
 */
export function speechCommand(
  apiAvailable: boolean,
  currentId: string | null,
  postId: string,
  text: string,
  isSpeaking: boolean
): SpeechCommand {
  /** This browser cannot talk. */
  if (!apiAvailable) {
    return { type: 'noop' }
  }

  /** Second click on the post that is talking. */
  if (isSpeaking && currentId === postId) {
    return { type: 'cancel' }
  }

  return { type: 'speak', text, rate: SPEECH_RATE }
}

/**
 * Turn the "copied everything" flag on, then schedule it to turn off.
 * Tests pass their own timer so they don't have to wait 2.5 seconds.
 */
export function armCopyAllReset(
  mark: (copied: boolean) => void,
  schedule: (fn: () => void, ms: number) => void
): void {
  /** Show the success label now. */
  mark(true)

  /** Hide it again after the usual delay. */
  schedule(() => {
    mark(false)
  }, COPY_ALL_RESET_MS)
}
