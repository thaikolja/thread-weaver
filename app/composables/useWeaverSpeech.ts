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
    window.speechSynthesis.getVoices()
  }

  /** Shut the voice up and clear the label. */
  function stop(): void {
    /** Only the browser has this API. */
    if (import.meta.client && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    speakingId.value = null
  }

  /** Chrome fills this list on a later tick. Give it a moment, then continue. */
  function readyVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
    /** Already populated, so Listen can start now. */
    const current = synth.getVoices()

    if (current.length > 0) {
      return Promise.resolve(current)
    }

    return new Promise((resolve) => {
      /** Drop the listener if the browser never answers. */
      const finish = () => {
        window.clearTimeout(timer)
        synth.removeEventListener('voiceschanged', finish)
        resolve(synth.getVoices())
      }

      /** Some browsers never fire the event when the list stays empty. */
      const timer = window.setTimeout(finish, 400)

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

    if (voice) {
      utterance.voice = voice
    }

    /** A touch faster than a flat read. */
    utterance.rate = rate

    /** Clear the label when it finishes or fails. */
    utterance.onend = () => {
      speakingId.value = null
    }

    utterance.onerror = () => {
      speakingId.value = null
    }

    /** Chrome sometimes leaves the synth paused after a cancel. */
    synth.resume()

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
      return
    }

    /** Same card, already talking. */
    if (command.type === 'cancel') {
      synth.cancel()
      speakingId.value = null
      return
    }

    void speak(synth, command.text, command.rate, id)
  }

  return {
    speakingId,
    listen,
    stop
  }
}
