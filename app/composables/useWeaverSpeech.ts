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

/** Pure decision: speak, cancel, or do nothing. The voice ranking is pure too. */
import { rankVoice, speechBcp, speechCommand, speechLang } from '~/utils/weaver/speech'

/**
 * The Listen button.
 * One card talks at a time. The voice is already on the machine, and it follows the words on the card.
 * Clicking the same card again stops it.
 */
export function useWeaverSpeech() {
  /** Id of the card that is speaking, or null. */
  const speakingId = ref<string | null>(null)

  /** Ask for the list now, so the first Listen click is not racing an empty array. */
  if (import.meta.client && 'speechSynthesis' in window) {
    // Warm up the voice list before the user clicks.
    window.speechSynthesis.getVoices()
  }

  /** Shut the voice up and clear the label. */
  function stop(): void {
    /** Only the browser has this API. */
    if (import.meta.client && 'speechSynthesis' in window) {
      // Cut off whatever is being read.
      window.speechSynthesis.cancel()
    }

    // Clear the button label as well.
    speakingId.value = null
  }

  /** Chrome fills this list on a later tick. Give it a moment, then continue. */
  function readyVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
    /** Already populated, so Listen can start now. */
    const current = synth.getVoices()

    // The list is already there, so continue right away.
    if (current.length > 0) {
      // No need to wait for the event.
      return Promise.resolve(current)
    }

    // Wait for the voiceschanged event, with a short timeout as a fallback.
    return new Promise((resolve) => {
      /** Drop the listener if the browser never answers. */
      const finish = () => {
        // Stop the fallback timer.
        window.clearTimeout(timer)

        // Remove the event listener now that we are done.
        synth.removeEventListener('voiceschanged', finish)

        // Return whatever the browser has at this point.
        resolve(synth.getVoices())
      }

      /** Some browsers never fire the event when the list stays empty. */
      const timer = window.setTimeout(finish, 400)

      // Continue as soon as the browser fills the list.
      synth.addEventListener('voiceschanged', finish)
    })
  }

  /** Read one card with the clearest installed voice. */
  async function speak(synth: SpeechSynthesis, text: string, rate: number, id: string): Promise<void> {
    /** Stop whatever else was talking. */
    synth.cancel()

    /** Mark this card before the voice starts, so the button flips immediately. */
    speakingId.value = id

    /** Voices the machine already has. Nothing is downloaded. */
    const voices = await readyVoices(synth)

    /** A second click landed while the list was loading. */
    if (speakingId.value !== id) {
      // Another card took over, so leave this one alone.
      return
    }

    /** The new line to read. */
    const utterance = new SpeechSynthesisUtterance(text)

    /** `en`, `de`, or `th`, from the words on the card. */
    const lang = speechLang(text, navigator.language)

    /** Best installed voice for that language. */
    const picked = rankVoice(
      voices.map(voice => ({
        name:         voice.name,
        lang:         voice.lang,
        localService: voice.localService,
        default:      voice.default
      })),
      lang
    )

    /** The real voice object behind that name. */
    const voice = picked
      ? voices.find(candidate => candidate.name === picked.name && candidate.lang === picked.lang)
      : undefined

    /** Lang first. Chrome drops a German voice when the utterance lang stays English. */
    utterance.lang = voice?.lang || speechBcp(lang)

    // Attach the real voice object when the list gave us one.
    if (voice) {
      // Let this exact installed voice read the card.
      utterance.voice = voice
    }

    /** A touch faster than a flat read. */
    utterance.rate = rate

    /** Clear the label when it finishes or fails. */
    utterance.onend = () => {
      // The card is no longer speaking.
      speakingId.value = null
    }

    // A failed read should not leave the button stuck.
    utterance.onerror = () => {
      // Clear the label after an error.
      speakingId.value = null
    }

    /** Chrome sometimes leaves the synth paused after a cancel. */
    synth.resume()

    // Start reading this card.
    synth.speak(utterance)
  }

  /** Speak this card, or stop if it is already the one speaking. */
  function listen(text: string, id: string): void {
    /** False during server render. */
    const api = import.meta.client && 'speechSynthesis' in window

    /** The browser voice, when it exists. */
    const synth = api ? window.speechSynthesis : null

    /** Speak, cancel, or ignore. */
    const command = speechCommand(
      api,
      speakingId.value,
      id,
      text,
      Boolean(synth?.speaking)
    )

    /** Nothing to do, or no voice to drive. */
    if (command.type === 'noop' || !synth) {
      // The browser cannot talk, so ignore the click.
      return
    }

    /** Same card, already talking. */
    if (command.type === 'cancel') {
      // Stop the current read and clear the label.
      synth.cancel()

      // No card should look active after a cancel.
      speakingId.value = null

      // Done with this click.
      return
    }

    // Start the read without making the click handler wait.
    void speak(synth, command.text, command.rate, id)
  }

  // Expose the active card and the two actions.
  return {
    speakingId,
    listen,
    stop
  }
}
