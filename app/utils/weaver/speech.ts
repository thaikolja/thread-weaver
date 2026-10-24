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

/** How long the copy-all flag lasts, and how fast speech talks. */
import { COPY_ALL_RESET_MS, SPEECH_RATE } from './limits'

/** The three things Listen can decide to do. */
import type { SpeechCommand } from './types'

/** One voice the browser already has installed. */
export interface ListedVoice {
  name: string
  lang: string
  localService: boolean
  default: boolean
}

/** Names that stay understandable. Earlier names win a tie. */
const CLEAR_NAMES = [
  'samantha',
  'aaron',
  'alex',
  'nicky',
  'evan',
  'karen',
  'moira',
  'daniel',
  'tom',
  'serena',
  'fiona',
  'tessa',
  'veena',
  'anna',
  'markus',
  'petra',
  'google us english'
]

/** Joke and cartoon voices. The German names are the same voices on a German Mac. */
const NOVELTY_NAMES = new Set([
  'albert',
  'bad news',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'deranged',
  'eddy',
  'flo',
  'fred',
  'glocken',
  'good news',
  'grandma',
  'grandpa',
  'gute neuigkeiten',
  'hysterical',
  'jester',
  'junior',
  'kathy',
  'organ',
  'pipe organ',
  'princess',
  'ralph',
  'reed',
  'rocko',
  'sandy',
  'schlechte neuigkeiten',
  'seifenblasen',
  'shelley',
  'spaßvogel',
  'spassvogel',
  'superstar',
  'trinoids',
  'whisper',
  'flüstern',
  'fluestern',
  'wobble',
  'zarvox'
])

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

/** The voice family, so `Anna (premium)` and `Grandma (Deutsch)` match by the first word. */
function family(name: string): string {
  return name.toLowerCase().split(' (')[0]?.trim() ?? ''
}

/** `en-US` and `en` are the same language for this choice. */
function primaryLang(lang: string): string {
  return lang.toLowerCase().split('-')[0] ?? ''
}

/** Compact voices are the quiet, muffled copies. */
function isCompact(name: string): boolean {
  return name.toLowerCase().includes('compact')
}

/** True when the name is one of the macOS joke or cartoon voices. */
function isNovelty(name: string): boolean {
  return NOVELTY_NAMES.has(family(name))
}

/** How well we know this name. Premium and enhanced copies rank higher. */
function clarity(name: string): number {
  /** Where this name sits in the preferred list. */
  const index = CLEAR_NAMES.indexOf(family(name))

  /** Unknown names get no bonus. */
  let score = index < 0 ? 0 : CLEAR_NAMES.length - index

  if (/\((enhanced|premium|erweitert)\)/i.test(name)) {
    score += 2
  }

  return score
}

/** German words, including ones with no umlaut. */
const GERMAN_WORDS = new Set([
  'aber', 'am', 'auch', 'auf', 'aus', 'bevor', 'bei', 'bitte', 'blamieren', 'das', 'dass',
  'dein', 'deine', 'deinem', 'deinen', 'deiner', 'deines', 'dem', 'den', 'denn', 'der',
  'dich', 'die', 'diese', 'dieser', 'dieses', 'dir', 'dort', 'du', 'ein', 'eine', 'einem',
  'einen', 'einer', 'euch', 'für', 'gedanken', 'genau', 'gut', 'hallo', 'hat', 'haben',
  'hier', 'ich', 'ihr', 'im', 'ist', 'ja', 'kein', 'keine', 'mein', 'meine', 'mich', 'mir',
  'mit', 'mehr', 'morgen', 'nach', 'nein', 'nicht', 'noch', 'nur', 'oder', 'schon', 'sehr',
  'sein', 'seine', 'sich', 'sie', 'sind', 'steht', 'über', 'und', 'uns', 'unter', 'von',
  'war', 'was', 'wenn', 'wer', 'wie', 'wir', 'zu', 'zum', 'zur', 'zusammen'
])

/** English words that show up in the sample and in ordinary posts. */
const ENGLISH_WORDS = new Set([
  'a', 'and', 'are', 'before', 'from', 'for', 'have', 'here', 'i', 'in', 'is', 'it', 'of',
  'on', 'that', 'the', 'this', 'to', 'was', 'with', 'you', 'your'
])

/** Words in the post, folded so `Für` and `für` match. */
function speechWords(text: string): string[] {
  return text.toLowerCase().match(/[a-zäöüß]+/g) ?? []
}

/** How many of those words sit in one list. */
function wordHits(words: readonly string[], list: ReadonlySet<string>): number {
  return words.filter(word => list.has(word)).length
}

/**
 * Which language the post is in: `en`, `de`, or `th`.
 * Thai script wins. Otherwise the words decide. The Mac language is only a fallback.
 */
export function speechLang(text: string, browserLang: string): string {
  if (/[\u0E00-\u0E7F]/.test(text)) {
    return 'th'
  }

  /** Tokens we can look up. An umlaut is German even before the count. */
  const words = speechWords(text)

  /** German hits, then English hits. */
  const german = wordHits(words, GERMAN_WORDS)

  /** English hits from the same tokens. */
  const english = wordHits(words, ENGLISH_WORDS)

  if (/[äöüß]/.test(text.toLowerCase()) || german > english) {
    return 'de'
  }

  if (english > german) {
    return 'en'
  }

  if (/[a-z]/i.test(text)) {
    return 'en'
  }

  return primaryLang(browserLang || 'en') || 'en'
}

/** The tag Chrome expects on an utterance when no installed voice supplied one. */
export function speechBcp(lang: string): string {
  if (lang === 'de') {
    return 'de-DE'
  }

  if (lang === 'th') {
    return 'th-TH'
  }

  return 'en-US'
}

/** Higher clarity first, then the voice the system already marked as default. */
function compareVoices(left: ListedVoice, right: ListedVoice): number {
  /** Preferred names beat generic ones. */
  const clarityGap = clarity(right.name) - clarity(left.name)

  if (clarityGap !== 0) {
    return clarityGap
  }

  if (left.default !== right.default) {
    return left.default ? -1 : 1
  }

  return left.name.localeCompare(right.name)
}

/**
 * Pick the voice Listen should use.
 * Local voices for the post's language come first. Compact and joke voices are skipped.
 * A remote voice is only used when the machine has no clear local one.
 */
export function rankVoice(voices: readonly ListedVoice[], preferredLang: string): ListedVoice | null {
  /** Voices a person can follow. */
  const usable = voices.filter(voice => !isCompact(voice.name) && !isNovelty(voice.name))

  if (usable.length === 0) {
    return null
  }

  /** Language of the browser, then English, and local before remote. */
  const wanted = primaryLang(preferredLang || 'en')

  /** Search these pools in order and take the first that has a voice. */
  const pools = [
    usable.filter(voice => voice.localService && primaryLang(voice.lang) === wanted),
    usable.filter(voice => voice.localService && primaryLang(voice.lang) === 'en'),
    usable.filter(voice => !voice.localService && primaryLang(voice.lang) === wanted),
    usable.filter(voice => !voice.localService && primaryLang(voice.lang) === 'en'),
    usable.filter(voice => voice.localService),
    usable
  ]

  for (const pool of pools) {
    if (pool.length === 0) {
      continue
    }

    return [...pool].sort(compareVoices)[0] ?? null
  }

  return null
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
