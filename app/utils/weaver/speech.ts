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
    // Nothing to start, so pretend the click never happened.
    return { type: 'noop' }
  }

  /** Second click on the post that is talking. */
  if (isSpeaking && currentId === postId) {
    // The same card is already talking, so stop it.
    return { type: 'cancel' }
  }

  // Anything else starts reading this card at the usual rate.
  return { type: 'speak', text, rate: SPEECH_RATE }
}

/** The voice family, so `Anna (premium)` and `Grandma (Deutsch)` match by the first word. */
function family(name: string): string {
  // Cut the name at the first parenthesis and tidy the space around it.
  return name.toLowerCase().split(' (')[0]?.trim() ?? ''
}

/** `en-US` and `en` are the same language for this choice. */
function primaryLang(lang: string): string {
  // Drop the region part and keep the bare language code.
  return lang.toLowerCase().split('-')[0] ?? ''
}

/** Compact voices are the quiet, muffled copies. */
function isCompact(name: string): boolean {
  // The word compact is enough to rule a voice out.
  return name.toLowerCase().includes('compact')
}

/** True when the name is one of the macOS joke or cartoon voices. */
function isNovelty(name: string): boolean {
  // Compare the family name against the joke list.
  return NOVELTY_NAMES.has(family(name))
}

/** How well we know this name. Premium and enhanced copies rank higher. */
function clarity(name: string): number {
  /** Where this name sits in the preferred list. */
  const index = CLEAR_NAMES.indexOf(family(name))

  /** Unknown names get no bonus. */
  let score = index < 0 ? 0 : CLEAR_NAMES.length - index

  // Better sounding copies get a small push up the list.
  if (/\((enhanced|premium|erweitert)\)/i.test(name)) {
    // Reward the clearer version of the same voice.
    score += 2
  }

  // Higher score means a clearer voice.
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
  // Pull out the plain words so the language lists can match them.
  return text.toLowerCase().match(/[a-zäöüß]+/g) ?? []
}

/** How many of those words sit in one list. */
function wordHits(words: readonly string[], list: ReadonlySet<string>): number {
  // Count only the words that appear in the chosen list.
  return words.filter(word => list.has(word)).length
}

/**
 * Which language the post is in: `en`, `de`, or `th`.
 * Thai script wins. Otherwise the words decide. The Mac language is only a fallback.
 */
export function speechLang(text: string, browserLang: string): string {
  // Thai script is unmistakable, so it wins immediately.
  if (/[\u0E00-\u0E7F]/.test(text)) {
    // Read Thai with a Thai voice.
    return 'th'
  }

  /** Tokens we can look up. An umlaut is German even before the count. */
  const words = speechWords(text)

  /** German hits, then English hits. */
  const german = wordHits(words, GERMAN_WORDS)

  /** English hits from the same tokens. */
  const english = wordHits(words, ENGLISH_WORDS)

  // An umlaut or more German hits means the post is German.
  if (/[äöüß]/.test(text.toLowerCase()) || german > english) {
    // Pick a German voice.
    return 'de'
  }

  // More English hits means the post is English.
  if (english > german) {
    // Pick an English voice.
    return 'en'
  }

  // Plain Latin letters lean English when the counts tie.
  if (/[a-z]/i.test(text)) {
    // Fall back to English rather than the browser language.
    return 'en'
  }

  // No useful words, so use the browser language and default to English.
  return primaryLang(browserLang || 'en') || 'en'
}

/** The tag Chrome expects on an utterance when no installed voice supplied one. */
export function speechBcp(lang: string): string {
  // German needs the full tag Chrome understands.
  if (lang === 'de') {
    // German as spoken in Germany.
    return 'de-DE'
  }

  // Thai needs its own full tag.
  if (lang === 'th') {
    // Thai as spoken in Thailand.
    return 'th-TH'
  }

  // Everything else gets the default English tag.
  return 'en-US'
}

/** Higher clarity first, then the voice the system already marked as default. */
function compareVoices(left: ListedVoice, right: ListedVoice): number {
  /** Preferred names beat generic ones. */
  const clarityGap = clarity(right.name) - clarity(left.name)

  // A clearer name sorts first.
  if (clarityGap !== 0) {
    // Negative means left comes first.
    return clarityGap
  }

  // When clarity ties, the system default wins.
  if (left.default !== right.default) {
    // The default voice should be considered first.
    return left.default ? -1 : 1
  }

  // Otherwise sort alphabetically so the order is stable.
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

  // Every voice was compact or a joke, so there is nothing to pick.
  if (usable.length === 0) {
    // No usable voice on this machine.
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

  // Walk the pools in priority order and use the first one that has a voice.
  for (const pool of pools) {
    // Empty pool, so try the next preference.
    if (pool.length === 0) {
      // Nothing in this pool.
      continue
    }

    // Sort the pool by clarity and take the best voice.
    return [...pool].sort(compareVoices)[0] ?? null
  }

  // No pool matched, which should not happen after the usable check.
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
    // Hide the success label after the delay.
    mark(false)
  }, COPY_ALL_RESET_MS)
}
