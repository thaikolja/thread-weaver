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

/** Remembers which card is talking. */
import { ref } from 'vue'

/** Pure decision: speak, cancel, or do nothing. */
import { speechCommand } from '~/utils/weaver/speech'

/**
 * The Listen button.
 * One card talks at a time. Clicking it again stops it.
 */
export function useWeaverSpeech() {
  /** Id of the card that is speaking, or null. */
  const speakingId = ref<string | null>(null)

  /** Shut the voice up and clear the label. */
  function stop(): void {
    /** Only the browser has this API. */
    if (import.meta.client && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    speakingId.value = null
  }

  /** Speak this card, or stop if it is already the one speaking. */
  function listen(text: string, id: string): void {
    /** False during server render. */
    const api = import.meta.client && 'speechSynthesis' in window

    /** The browser voice, when it exists. */
    const synth = api ? window.speechSynthesis : null

    /** Speak, cancel, or ignore. */
    const command = speechCommand(api, speakingId.value, id, text, Boolean(synth?.speaking))

    /** Nothing to do, or no voice to drive. */
    if (command.type === 'noop' || !synth) {
      return
    }

    /** Same card, already talking. */
    if (command.type === 'cancel') {
      synth.cancel()
      speakingId.value = null
      return
    }

    /** Stop whatever else was talking. */
    synth.cancel()

    /** The new line to read. */
    const utterance = new SpeechSynthesisUtterance(command.text)

    /** A touch faster than a flat read. */
    utterance.rate = command.rate

    /** Clear the label when it finishes or fails. */
    utterance.onend = () => {
      speakingId.value = null
    }

    utterance.onerror = () => {
      speakingId.value = null
    }

    /** Mark this card before the voice starts, so the button flips immediately. */
    speakingId.value = id

    synth.speak(utterance)
  }

  return {
    speakingId,
    listen,
    stop
  }
}
