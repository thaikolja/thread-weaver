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

/** Bun's test runner. */
import { expect, test }                                                      from 'bun:test'

/** Read the files the page is built from. */
import { readFileSync, readdirSync }                                         from 'node:fs'

/** Join a directory and a file name. */
import { join }                                                              from 'node:path'

/** Turn chunks into posts. */
import { compileThread }                                                     from '../app/utils/weaver/compile.ts'

/** Sample text, copy delay, and speech rate. */
import { COPY_ALL_RESET_MS, SAMPLE_SOURCE, SPEECH_RATE }                     from '../app/utils/weaver/limits.ts'

/** Totals, read time, and the ring color. */
import { readTimeMinutes, ringColor, ringTextColor, totalChars, totalWords } from '../app/utils/weaver/metrics.ts'

/** Copy-all, markdown, intents, and the QR address. */
import { copyAllBody, intentUrl, markdownBody, markdownFilename }            from '../app/utils/weaver/publish.ts'

/** Speech decision, voice choice, and the copy-all timer. */
import { armCopyAllReset, rankVoice, speechBcp, speechCommand, speechLang }  from '../app/utils/weaver/speech.ts'

/** Normalize and pack. */
import { splitSource }                                                       from '../app/utils/weaver/split.ts'

/** Editor edits we drive directly. */
import {
  createWeaverState,
  dropSegment,
  moveSegment,
  setBridge,
  setCapitalize,
  setFinishSentences,
  setKeepBreaks,
  setMarker,
  setPlacement,
  setPlatform,
  setSource
}                                                                            from '../app/utils/weaver/state.ts'

/** The four limits. */
import { PLATFORM_LIMITS }                                                   from '../app/utils/weaver/types.ts'

/** Marker and placement names. */
import type { MarkerFormat, MarkerPlacement }                                from '../app/utils/weaver/types.ts'

/** Two short chunks used by the marker table. */
const BLOCKS = [
  { id: 'block-0', text: 'Alpha' },
  { id: 'block-1', text: 'Beta' }
]

/** Compile those two chunks with one marker setup. */
function compilePair(marker: MarkerFormat, placement: MarkerPlacement, bridge = '') {
  // Compile the two sample chunks with the setup under test.
  return compileThread({ blocks: BLOCKS, marker, placement, bridge })
}

/** Read every file in a folder that ends with the given suffix. */
function readMatching(directory: URL, suffix: string): string[] {
  // Read only the files with this ending.
  return readdirSync(directory)
  .filter(name => name.endsWith(suffix))
  .map(name => readFileSync(join(directory.pathname, name), 'utf8'))
}

/** Dot paths of every string in a locale file. */
function messageKeys(value: unknown, prefix = ''): string[] {
  /** A leaf is one message. */
  if (typeof value === 'string') {
    // The current path is the key for this message.
    return [ prefix ]
  }

  /** Numbers and null are not copy. */
  if (!value || typeof value !== 'object') {
    // Nothing to collect below this value.
    return []
  }

  // Walk the object and collect a path for every nested message.
  return Object.entries(value as Record<string, unknown>).flatMap(([ key, child ]) => {
    /** `header.kicker`, and so on. */
    const path = prefix ? `${prefix}.${key}` : key

    // Hand back the result.
    return messageKeys(child, path)
  })
}

/** The page, the components, and the modules they import, as one string. */
function vueSource(): string {
  /** Shell files that are not inside the scanned folders. */
  const files = [
    new URL('../app/pages/index.vue', import.meta.url),
    new URL('../app/app.vue', import.meta.url),
    new URL('../app/layouts/default.vue', import.meta.url)
  ]

  /** Start with those, then add the folders. */
  const chunks = files.map(file => readFileSync(file, 'utf8'))

  // Add every component in the components folder.
  chunks.push(...readMatching(new URL('../app/components/', import.meta.url), '.vue'))

  // Add the composables beside the page.
  chunks.push(...readMatching(new URL('../app/composables/', import.meta.url), '.ts'))

  // Add the pure weaver modules.
  chunks.push(...readMatching(new URL('../app/utils/weaver/', import.meta.url), '.ts'))

  // One string makes the text checks below easy.
  return chunks.join('\n')
}

/** A fresh editor is X, 280, parentheses, and the sample sentence in one card. */
test('default state splits the sample on the X budget', () => {
  // Set up state.
  const state = createWeaverState()

  // Make sure state.source is SAMPLE_SOURCE.
  expect(state.source).toBe(SAMPLE_SOURCE)

  // Make sure state.platform is 'x'.
  expect(state.platform).toBe('x')

  // Make sure state.limit is 280.
  expect(state.limit).toBe(280)

  // Make sure state.marker is 'parens'.
  expect(state.marker).toBe('parens')

  // Make sure state.placement is 'newline'.
  expect(state.placement).toBe('newline')

  // Make sure state.bridge is ''.
  expect(state.bridge).toBe('')

  // Make sure state.capitalize is false.
  expect(state.capitalize).toBe(false)

  // Make sure state.finishSentences is false.
  expect(state.finishSentences).toBe(false)

  // Make sure state.keepBreaks is false.
  expect(state.keepBreaks).toBe(false)

  // Make sure PLATFORM_LIMITS.x is 280.
  expect(PLATFORM_LIMITS.x).toBe(280)

  // Make sure PLATFORM_LIMITS.bsky is 300.
  expect(PLATFORM_LIMITS.bsky).toBe(300)

  // Make sure PLATFORM_LIMITS.threads is 500.
  expect(PLATFORM_LIMITS.threads).toBe(500)

  // Make sure PLATFORM_LIMITS.masto is 500.
  expect(PLATFORM_LIMITS.masto).toBe(500)

  // Make sure state.source.includes('Segment 1 of your unh… is true.
  expect(state.source.includes('Segment 1 of your unhinged monologue sits right here')).toBe(true)

  // Make sure state.blocks.length is 1.
  expect(state.blocks.length).toBe(1)

  // Make sure state.blocks[0]?.id is 'block-0'.
  expect(state.blocks[0]?.id).toBe('block-0')

  // Set up posts.
  const posts = compileThread(state)

  // Make sure posts[0]?.compiled is `${SAMPLE_SOURCE}\n\n(1/1)`.
  expect(posts[0]?.compiled).toBe(`${SAMPLE_SOURCE}\n\n(1/1)`)

  // Make sure totalChars(posts) is posts[0]?.compiled.length.
  expect(totalChars(posts)).toBe(posts[0]?.compiled.length)

  // Make sure totalWords(SAMPLE_SOURCE) is 29.
  expect(totalWords(SAMPLE_SOURCE)).toBe(29)

  // Make sure readTimeMinutes(totalWords(SAMPLE_SOURCE)) is 1.
  expect(readTimeMinutes(totalWords(SAMPLE_SOURCE))).toBe(1)
})

/** Words stay whole. One huge token is allowed to stick out past the limit. */
test('packs on whitespace without cutting a word, except one over-long token', () => {
  // Set up long.
  const long = Array.from({ length: 80 }, () => 'word').join(' ')

  // Make sure long.length is greater than 280.
  expect(long.length).toBeGreaterThan(280)

  // Set up blocks.
  const blocks = splitSource(long, 280, '', false)

  // Make sure blocks.length is 2.
  expect(blocks.length).toBe(2)

  // Make sure blocks.map(block => block.id) matches ['block-0', 'block-1'].
  expect(blocks.map(block => block.id)).toEqual([ 'block-0', 'block-1' ])

  // Make sure blocks.every(block => block.text.length <= 2… is true.
  expect(blocks.every(block => block.text.length <= 280 - 16)).toBe(true)

  // Make sure blocks.map(block => block.text).join(' ') is long.
  expect(blocks.map(block => block.text).join(' ')).toBe(long)

  // Go through each item in turn.
  for (const block of blocks) {
    // Go through each item in turn.
    for (const part of block.text.split(' ')) {
      // Make sure part is 'word'.
      expect(part).toBe('word')
    }
  }

  // Set up token.
  const token = 'Z'.repeat(300)

  // Set up mixed.
  const mixed = splitSource(`hello ${token} world`, 280, '', false)

  // Make sure mixed.map(block => block.text) matches ['hello', token, 'world'].
  expect(mixed.map(block => block.text)).toEqual([ 'hello', token, 'world' ])

  // Make sure mixed[1]?.text.length ?? 0 is greater than 280.
  expect(mixed[1]?.text.length ?? 0).toBeGreaterThan(280)
})

/** Each platform has its own cap, and a long string splits differently under them. */
test('platforms change the limit and the segment count', () => {
  // Set up letters.
  const letters = Array.from({ length: 400 }, () => 'a').join(' ')

  // Set up state.
  let state = createWeaverState(letters)

  // Make sure state.limit is 280.
  expect(state.limit).toBe(280)

  // Make sure state.blocks.length is 4.
  expect(state.blocks.length).toBe(4)

  // Run this step.
  state = setPlatform(state, 'bsky')

  // Make sure state.platform is 'bsky'.
  expect(state.platform).toBe('bsky')

  // Make sure state.limit is 300.
  expect(state.limit).toBe(300)

  // Make sure state.blocks.length is 3.
  expect(state.blocks.length).toBe(3)

  // Run this step.
  state = setPlatform(state, 'threads')

  // Make sure state.platform is 'threads'.
  expect(state.platform).toBe('threads')

  // Make sure state.limit is 500.
  expect(state.limit).toBe(500)

  // Make sure state.blocks.length is 2.
  expect(state.blocks.length).toBe(2)

  // Run this step.
  state = setPlatform(state, 'masto')

  // Make sure state.platform is 'masto'.
  expect(state.platform).toBe('masto')

  // Make sure state.limit is 500.
  expect(state.limit).toBe(500)

  // Make sure state.blocks.length is 2.
  expect(state.blocks.length).toBe(2)

  // Go through each item in turn.
  for (const block of state.blocks) {
    // Make sure block.text.length stays under 500 - 16.
    expect(block.text.length).toBeLessThanOrEqual(500 - 16)

    // Make sure block.text.split(' ').every(part => part ===… is true.
    expect(block.text.split(' ').every(part => part === 'a')).toBe(true)
  }
})

/** Every marker and placement produces the exact string we publish. */
test('marker formats and placements match the compiled strings', () => {
  // Set up cases.
  const cases: Array<[ MarkerFormat, MarkerPlacement, string, string, string ]> = [
    [ 'parens', 'newline', '', 'Alpha\n\n(1/2)', 'Beta\n\n(2/2)' ],
    [ 'parens', 'inline-after', '', 'Alpha (1/2)', 'Beta (2/2)' ],
    [ 'parens', 'inline-before', '', '(1/2) Alpha', '(2/2) Beta' ],
    [ 'parens', 'start', '', '(1/2)\n\nAlpha', '(2/2)\n\nBeta' ],
    [ 'brackets', 'newline', '', 'Alpha\n\n[1/2]', 'Beta\n\n[2/2]' ],
    [ 'brackets', 'inline-after', '', 'Alpha [1/2]', 'Beta [2/2]' ],
    [ 'brackets', 'inline-before', '', '[1/2] Alpha', '[2/2] Beta' ],
    [ 'brackets', 'start', '', '[1/2]\n\nAlpha', '[2/2]\n\nBeta' ],
    [ 'slash', 'newline', '', 'Alpha\n\n1/2', 'Beta\n\n2/2' ],
    [ 'slash', 'inline-after', '', 'Alpha 1/2', 'Beta 2/2' ],
    [ 'slash', 'inline-before', '', '1/2 Alpha', '2/2 Beta' ],
    [ 'slash', 'start', '', '1/2\n\nAlpha', '2/2\n\nBeta' ],
    [ 'hash', 'newline', '', 'Alpha\n\n#1', 'Beta\n\n#2' ],
    [ 'hash', 'inline-after', '', 'Alpha #1', 'Beta #2' ],
    [ 'hash', 'inline-before', '', '#1 Alpha', '#2 Beta' ],
    [ 'hash', 'start', '', '#1\n\nAlpha', '#2\n\nBeta' ],
    [ 'none', 'newline', '', 'Alpha', 'Beta' ],
    [ 'none', 'inline-after', '', 'Alpha', 'Beta' ],
    [ 'none', 'inline-before', '', 'Alpha', 'Beta' ],
    [ 'none', 'start', '', 'Alpha', 'Beta' ],
    [ 'parens', 'inline-after', '//', 'Alpha // (1/2)', 'Beta // (2/2)' ],
    [ 'parens', 'inline-before', '//', '(1/2) // Alpha', '(2/2) // Beta' ],
    [ 'parens', 'newline', '//', 'Alpha\n\n//\n\n(1/2)', 'Beta\n\n//\n\n(2/2)' ],
    [ 'parens', 'start', '>>', '(1/2)\n\n>>\n\nAlpha', '(2/2)\n\n>>\n\nBeta' ],
    [ 'none', 'inline-after', '//', 'Alpha', 'Beta' ]
  ]

  // Go through each item in turn.
  for (const [ marker, placement, bridge, first, second ] of cases) {
    // Set up posts.
    const posts = compilePair(marker, placement, bridge)

    // Make sure posts[0]?.compiled is first.
    expect(posts[0]?.compiled).toBe(first)

    // Make sure posts[1]?.compiled is second.
    expect(posts[1]?.compiled).toBe(second)
  }
})

/** Listen reads the card, and it skips the chunk counter. */
test('listen reads the post without the chunk counter', () => {
  // Set up cases.
  const cases: Array<[ MarkerFormat, MarkerPlacement, string, string, string ]> = [
    [ 'parens', 'newline', '', 'Alpha', 'Beta' ],
    [ 'parens', 'inline-after', '', 'Alpha', 'Beta' ],
    [ 'parens', 'inline-before', '', 'Alpha', 'Beta' ],
    [ 'parens', 'start', '', 'Alpha', 'Beta' ],
    [ 'brackets', 'newline', '', 'Alpha', 'Beta' ],
    [ 'brackets', 'inline-after', '', 'Alpha', 'Beta' ],
    [ 'brackets', 'inline-before', '', 'Alpha', 'Beta' ],
    [ 'brackets', 'start', '', 'Alpha', 'Beta' ],
    [ 'slash', 'newline', '', 'Alpha', 'Beta' ],
    [ 'slash', 'inline-after', '', 'Alpha', 'Beta' ],
    [ 'slash', 'inline-before', '', 'Alpha', 'Beta' ],
    [ 'slash', 'start', '', 'Alpha', 'Beta' ],
    [ 'hash', 'newline', '', 'Alpha', 'Beta' ],
    [ 'hash', 'inline-after', '', 'Alpha', 'Beta' ],
    [ 'hash', 'inline-before', '', 'Alpha', 'Beta' ],
    [ 'hash', 'start', '', 'Alpha', 'Beta' ],
    [ 'none', 'newline', '', 'Alpha', 'Beta' ],
    [ 'parens', 'inline-after', '//', 'Alpha //', 'Beta //' ],
    [ 'parens', 'inline-before', '//', '// Alpha', '// Beta' ],
    [ 'parens', 'newline', '//', 'Alpha\n\n//', 'Beta\n\n//' ],
    [ 'parens', 'start', '>>', '>>\n\nAlpha', '>>\n\nBeta' ],
    [ 'brackets', 'newline', '...', 'Alpha\n\n...', 'Beta\n\n...' ],
    [ 'none', 'inline-after', '//', 'Alpha', 'Beta' ]
  ]

  // Go through each item in turn.
  for (const [ marker, placement, bridge, first, second ] of cases) {
    // Set up posts.
    const posts = compilePair(marker, placement, bridge)

    // Make sure posts[0]?.spoken is first.
    expect(posts[0]?.spoken).toBe(first)

    // Make sure posts[1]?.spoken is second.
    expect(posts[1]?.spoken).toBe(second)
  }

  /** A counter written inside the post stays. Only the one we attach is dropped. */
  const quoted = compileThread({
    blocks:    [ { id: 'block-0', text: 'See [1/2] in the notes' } ],
    marker:    'brackets',
    placement: 'newline',
    bridge:    ''
  })

  // Make sure quoted[0]?.compiled is 'See [1/2] in the notes\n\n[1/1]'.
  expect(quoted[0]?.compiled).toBe('See [1/2] in the notes\n\n[1/1]')

  // Make sure quoted[0]?.spoken is 'See [1/2] in the notes'.
  expect(quoted[0]?.spoken).toBe('See [1/2] in the notes')

  /** An empty card has nothing to say once the counter is gone. */
  const empty = compileThread(setSource(createWeaverState(), ''))

  // Make sure empty[0]?.spoken is ''.
  expect(empty[0]?.spoken).toBe('')

  /** The button passes that string straight into the speech decision. */
  const spoken = compilePair('brackets', 'newline')[0]?.spoken ?? ''

  // Make sure spoken is 'Alpha'.
  expect(spoken).toBe('Alpha')

  // Make sure speechCommand(true, null, 'block-0', spoken,… matches { type: 'speak', text: 'Alpha', rate: SPEECH….
  expect(speechCommand(true, null, 'block-0', spoken, false)).toEqual({
    type: 'speak',
    text: 'Alpha',
    rate: SPEECH_RATE
  })

  /** The Listen click uses the spoken string, not the card that still shows the counter. */
  const actions = readFileSync(new URL('../app/components/PostActions.vue', import.meta.url), 'utf8')

  // Make sure actions contains 'weaver.listen(post.spoken, post.id)'.
  expect(actions).toContain('weaver.listen(post.spoken, post.id)')
})

/** Typing a bridge shows it on the default layout without another control change. */
test('typing a bridge updates the default newline preview immediately', () => {
  // Set up fresh.
  const fresh = createWeaverState()

  // Set up withDots.
  const withDots = setBridge(fresh, '...')

  // Make sure withDots.placement is 'newline'.
  expect(withDots.placement).toBe('newline')

  // Make sure withDots.blocks.map(block => block.text) matches fresh.blocks.map(block => block.text).
  expect(withDots.blocks.map(block => block.text)).toEqual(fresh.blocks.map(block => block.text))

  // Make sure compileThread(withDots)[0]?.compiled is `${SAMPLE_SOURCE}\n\n...\n\n(1/1)`.
  expect(compileThread(withDots)[0]?.compiled).toBe(`${SAMPLE_SOURCE}\n\n...\n\n(1/1)`)

  // Set up swapped.
  const swapped = setBridge(withDots, '???')

  // Make sure swapped.blocks.map(block => block.id) matches withDots.blocks.map(block => block.id).
  expect(swapped.blocks.map(block => block.id)).toEqual(withDots.blocks.map(block => block.id))

  // Make sure compileThread(swapped)[0]?.compiled is `${SAMPLE_SOURCE}\n\n???\n\n(1/1)`.
  expect(compileThread(swapped)[0]?.compiled).toBe(`${SAMPLE_SOURCE}\n\n???\n\n(1/1)`)

  // Make sure compileThread(swapped)[0]?.compiled.includes… is false.
  expect(compileThread(swapped)[0]?.compiled.includes('...')).toBe(false)
})

/** A longer bridge leaves less room in each chunk and changes the inline gap. */
test('a longer bridge shrinks the packing budget and changes the inline joiner', () => {
  // Set up hi.
  const hi = Array.from({ length: 83 }, () => 'hi').join(' ')

  // Make sure hi.length is 248.
  expect(hi.length).toBe(248)

  // Make sure splitSource(hi, 280, '', false).length is 1.
  expect(splitSource(hi, 280, '', false).length).toBe(1)

  // Set up bridged.
  const bridged = splitSource(hi, 280, 'x'.repeat(20), false)

  // Make sure bridged.length is 2.
  expect(bridged.length).toBe(2)

  // Make sure bridged.every(block => block.text.length <= … is true.
  expect(bridged.every(block => block.text.length <= 280 - 16 - 20)).toBe(true)

  // Make sure bridged.map(block => block.text).join(' ') is hi.
  expect(bridged.map(block => block.text).join(' ')).toBe(hi)

  // Set up posts.
  const posts = compilePair('parens', 'inline-after', '>>')

  // Make sure posts[0]?.compiled is 'Alpha >> (1/2)'.
  expect(posts[0]?.compiled).toBe('Alpha >> (1/2)')
})

/** Capitalize, finish sentences, and keep line breaks change the published text. */
test('text tools capitalize, close a sentence, and keep a line break', () => {
  // Set up plain.
  const plain = setSource(createWeaverState(), 'alpha beta')

  // Set up capitalized.
  const capitalized = setCapitalize(plain, true)

  // Make sure capitalized.blocks[0]?.text is 'alpha beta'.
  expect(capitalized.blocks[0]?.text).toBe('alpha beta')

  // Make sure compileThread(capitalized)[0]?.compiled.star… is true.
  expect(compileThread(capitalized)[0]?.compiled.startsWith('Alpha beta')).toBe(true)

  // Set up closed.
  const closed = setFinishSentences(setSource(createWeaverState(), 'Hello'), true)

  // Make sure compileThread(closed)[0]?.raw is 'Hello…'.
  expect(compileThread(closed)[0]?.raw).toBe('Hello…')

  // Set up already.
  const already = setFinishSentences(setSource(createWeaverState(), 'Hello.'), true)

  // Make sure compileThread(already)[0]?.raw is 'Hello.'.
  expect(compileThread(already)[0]?.raw).toBe('Hello.')

  // Make sure splitSource('hello\n\nworld', 280, '', false… is 'hello world'.
  expect(splitSource('hello\n\nworld', 280, '', false)[0]?.text).toBe('hello world')

  // Make sure splitSource('hello\n\nworld', 280, '', true)… is 'hello\n\nworld'.
  expect(splitSource('hello\n\nworld', 280, '', true)[0]?.text).toBe('hello\n\nworld')

  // Set up kept.
  const kept = setKeepBreaks(setSource(createWeaverState(), 'hello\nworld'), true)

  // Make sure kept.blocks[0]?.text is 'hello\nworld'.
  expect(kept.blocks[0]?.text).toBe('hello\nworld')
})

/** A blank box is one empty card, not zero cards. */
test('empty input yields one empty segment', () => {
  // Make sure splitSource('', 280, '', false) matches [{ id: 'b-0', text: '' }].
  expect(splitSource('', 280, '', false)).toEqual([ { id: 'b-0', text: '' } ])

  // Make sure splitSource(' \n\t ', 280, '', true) matches [{ id: 'b-0', text: '' }].
  expect(splitSource('  \n\t ', 280, '', true)).toEqual([ { id: 'b-0', text: '' } ])

  // Set up state.
  const state = setSource(createWeaverState(), '')

  // Make sure state.blocks matches [{ id: 'b-0', text: '' }].
  expect(state.blocks).toEqual([ { id: 'b-0', text: '' } ])

  // Make sure totalWords('') is 0.
  expect(totalWords('')).toBe(0)

  // Make sure totalWords(' ') is 0.
  expect(totalWords('   ')).toBe(0)

  // Make sure compileThread(state)[0]?.compiled is '\n\n(1/1)'.
  expect(compileThread(state)[0]?.compiled).toBe('\n\n(1/1)')
})

/** Reorder and drop stick until a pack-again edit throws that order away. */
test('move and drop keep segment text until source, line breaks, platform, or bridge length changes', () => {
  // Set up numbered.
  const numbered = Array.from({ length: 80 }, (_, index) => `w${String(index).padStart(2, '0')}`).join(' ')

  // Set up original.
  const original = createWeaverState(numbered)

  // Make sure original.blocks.length is greater than 1.
  expect(original.blocks.length).toBeGreaterThan(1)

  // Set up originalText.
  const originalText = original.blocks.map(block => block.text)

  // Set up state.
  let state = moveSegment(original, 0, 1)

  // Set up moved.
  const moved = state.blocks.map(block => block.text)

  // Make sure moved matches [originalText[1], originalText[0], ...origin….
  expect(moved).toEqual([ originalText[1], originalText[0], ...originalText.slice(2) ])

  // Make sure moveSegment(state, 0, -1).blocks[0]?.text is originalText[1].
  expect(moveSegment(state, 0, -1).blocks[0]?.text).toBe(originalText[1])

  // Run this step.
  state = setMarker(state, 'hash')

  // Run this step.
  state = setPlacement(state, 'start')

  // Make sure state.blocks.map(block => block.text) matches moved.
  expect(state.blocks.map(block => block.text)).toEqual(moved)

  // Make sure compileThread(state)[0]?.compiled is `#1\n\n${moved[0]}`.
  expect(compileThread(state)[0]?.compiled).toBe(`#1\n\n${moved[0]}`)

  // Run this step.
  state = setSource(state, numbered)

  // Make sure state.blocks.map(block => block.text) matches originalText.
  expect(state.blocks.map(block => block.text)).toEqual(originalText)

  // Run this step.
  state = moveSegment(createWeaverState(numbered), 0, 1)

  // Run this step.
  state = setKeepBreaks(state, true)

  // Make sure state.blocks.map(block => block.text) matches originalText.
  expect(state.blocks.map(block => block.text)).toEqual(originalText)

  // Run this step.
  state = moveSegment(createWeaverState(numbered), 0, 1)

  // Set up movedBeforePlatform.
  const movedBeforePlatform = state.blocks.map(block => block.id)

  // Run this step.
  state = setPlatform(state, 'bsky')

  // Make sure state.limit is 300.
  expect(state.limit).toBe(300)

  // Make sure state.blocks.map(block => block.id) matches movedBeforePlatform.
  expect(state.blocks.map(block => block.id)).not.toEqual(movedBeforePlatform)

  // Make sure state.blocks.map(block => block.text) matches setPlatform(createWeaverState(numbered), 'bs….
  expect(state.blocks.map(block => block.text)).toEqual(
    setPlatform(createWeaverState(numbered), 'bsky').blocks.map(block => block.text)
  )

  // Run this step.
  state = moveSegment(createWeaverState(numbered), 0, 1)

  // Set up movedText.
  const movedText = state.blocks.map(block => block.text)

  // Run this step.
  state = setBridge(state, '>>>')

  // Make sure state.blocks.map(block => block.text) matches movedText.
  expect(state.blocks.map(block => block.text)).not.toEqual(movedText)

  // Make sure state.blocks.map(block => block.text) matches setBridge(createWeaverState(numbered), '>>>'….
  expect(state.blocks.map(block => block.text)).toEqual(
    setBridge(createWeaverState(numbered), '>>>').blocks.map(block => block.text)
  )

  // Run this step.
  state = setBridge(createWeaverState(numbered), 'ab')

  // Run this step.
  state = moveSegment(state, 0, 1)

  // Set up sameLengthOrder.
  const sameLengthOrder = state.blocks.map(block => block.text)

  // Run this step.
  state = setBridge(state, 'cd')

  // Run this step.
  state = setPlacement(state, 'inline-after')

  // Make sure state.blocks.map(block => block.text) matches sameLengthOrder.
  expect(state.blocks.map(block => block.text)).toEqual(sameLengthOrder)

  // Make sure compileThread(state)[0]?.compiled.includes('… is true.
  expect(compileThread(state)[0]?.compiled.includes(' cd ')).toBe(true)

  // Set up beforeDrop.
  const beforeDrop = createWeaverState(numbered).blocks.map(block => block.text)

  // Set up dropped.
  const dropped = dropSegment(createWeaverState(numbered), 1)

  // Make sure dropped.blocks.map(block => block.text) matches [beforeDrop[0], ...beforeDrop.slice(2)].
  expect(dropped.blocks.map(block => block.text)).toEqual([ beforeDrop[0], ...beforeDrop.slice(2) ])

  // Make sure dropped.blocks.some(block => block.text === … is false.
  expect(dropped.blocks.some(block => block.text === beforeDrop[1])).toBe(false)
})

/** Copy, download, send, QR, the ring, read time, and Listen all use the published text. */
test('copy-all, markdown, filenames, intents, QR, ring color, read time, and speech payloads', () => {
  // Set up posts.
  const posts = compilePair('parens', 'newline')

  // Make sure copyAllBody(posts) is 'Alpha\n\n(1/2)\n\n---\n\nBeta\n\n(2/2)'.
  expect(copyAllBody(posts)).toBe('Alpha\n\n(1/2)\n\n---\n\nBeta\n\n(2/2)')

  // Make sure markdownBody(posts) is '### Post 1\n\nAlpha\n\n(1/2)\n\n---\n\n### ….
  expect(markdownBody(posts)).toBe('### Post 1\n\nAlpha\n\n(1/2)\n\n---\n\n### Post 2\n\nBeta\n\n(2/2)')

  // Make sure markdownFilename('x', 1710000000000) is 'thread-x-1710000000000.md'.
  expect(markdownFilename('x', 1710000000000)).toBe('thread-x-1710000000000.md')

  // Make sure markdownFilename('bsky', 5) matches the pattern.
  expect(markdownFilename('bsky', 5)).toMatch(/^thread-bsky-.*\.md$/)

  // Make sure markdownFilename('threads', 5) matches the pattern.
  expect(markdownFilename('threads', 5)).toMatch(/^thread-threads-.*\.md$/)

  // Make sure markdownFilename('masto', 5) matches the pattern.
  expect(markdownFilename('masto', 5)).toMatch(/^thread-masto-.*\.md$/)

  // Set up compiled.
  const compiled = 'Alpha\n\n(1/2)'

  // Make sure intentUrl('x', compiled) is `https://x.com/intent/tweet?text=${encodeURI….
  expect(intentUrl('x', compiled)).toBe(`https://x.com/intent/tweet?text=${encodeURIComponent(compiled)}`)

  // Make sure intentUrl('bsky', compiled) is `https://bsky.app/intent/compose?text=${enco….
  expect(intentUrl('bsky', compiled)).toBe(`https://bsky.app/intent/compose?text=${encodeURIComponent(compiled)}`)

  // Make sure intentUrl('threads', compiled) is `https://www.threads.net/intent/post?text=${….
  expect(intentUrl('threads', compiled)).toBe(`https://www.threads.net/intent/post?text=${encodeURIComponent(compiled)}`)

  // Make sure intentUrl('masto', compiled) is `https://mastodon.social/share?text=${encode….
  expect(intentUrl('masto', compiled)).toBe(`https://mastodon.social/share?text=${encodeURIComponent(compiled)}`)

  // Make sure ringColor(281, 280) is 'hsl(0, 90%, 45%)'.
  expect(ringColor(281, 280)).toBe('hsl(0, 90%, 45%)')

  // Make sure ringColor(0, 280) is 'hsl(140, 80%, 42%)'.
  expect(ringColor(0, 280)).toBe('hsl(140, 80%, 42%)')

  // Set up ratio.
  const ratio = Math.min(1, Math.max(0, 100 / 280))

  // Make sure ringColor(100, 280) is `hsl(${(1 - ratio) * 140}, 80%, 42%)`.
  expect(ringColor(100, 280)).toBe(`hsl(${(1 - ratio) * 140}, 80%, 42%)`)

  // Make sure ringColor(280, 280) is 'hsl(0, 80%, 42%)'.
  expect(ringColor(280, 280)).toBe('hsl(0, 80%, 42%)')

  // Make sure ringTextColor(281, 280) is 'hsl(0, 90%, 45%)'.
  expect(ringTextColor(281, 280)).toBe('hsl(0, 90%, 45%)')

  // Make sure ringTextColor(0, 280) is 'hsl(140, 80%, 26%)'.
  expect(ringTextColor(0, 280)).toBe('hsl(140, 80%, 26%)')

  // Make sure ringTextColor(100, 280) is `hsl(${(1 - ratio) * 140}, 80%, 26%)`.
  expect(ringTextColor(100, 280)).toBe(`hsl(${(1 - ratio) * 140}, 80%, 26%)`)

  // Make sure readTimeMinutes(0) is 1.
  expect(readTimeMinutes(0)).toBe(1)

  // Make sure readTimeMinutes(100) is 1.
  expect(readTimeMinutes(100)).toBe(1)

  // Make sure readTimeMinutes(200) is 1.
  expect(readTimeMinutes(200)).toBe(1)

  // Make sure readTimeMinutes(300) is 2.
  expect(readTimeMinutes(300)).toBe(2)

  // Make sure totalWords(' a b \n c ') is 3.
  expect(totalWords('  a  b \n c ')).toBe(3)

  // Make sure totalChars(posts) is 'Alpha\n\n(1/2)'.length + 'Beta\n\n(2/2)'.le….
  expect(totalChars(posts)).toBe('Alpha\n\n(1/2)'.length + 'Beta\n\n(2/2)'.length)

  // Set up events.
  const events: boolean[] = []

  // Set up delay.
  let delay = 0

  // Set up queued.
  let queued: (() => void) | undefined

  // Run this step.
  armCopyAllReset((copied) => {
    // Run this step.
    events.push(copied)
  }, (fn, ms) => {
    // Run this step.
    delay = ms

    // Run this step.
    queued = fn
  })

  // Make sure events matches [true].
  expect(events).toEqual([ true ])

  // Make sure delay is COPY_ALL_RESET_MS.
  expect(delay).toBe(COPY_ALL_RESET_MS)

  // Make sure delay is 2500.
  expect(delay).toBe(2500)

  // Make sure queued exists.
  expect(queued).toBeDefined()

  // Run this step.
  queued?.()

  // Make sure events matches [true, false].
  expect(events).toEqual([ true, false ])

  // Make sure speechCommand(false, null, 'a', 'hi', false) matches { type: 'noop' }.
  expect(speechCommand(false, null, 'a', 'hi', false)).toEqual({ type: 'noop' })

  // Make sure speechCommand(true, 'a', 'a', 'hi', true) matches { type: 'cancel' }.
  expect(speechCommand(true, 'a', 'a', 'hi', true)).toEqual({ type: 'cancel' })

  // Make sure speechCommand(true, 'a', 'b', 'hi', true) matches { type: 'speak', text: 'hi', rate: SPEECH_RA….
  expect(speechCommand(true, 'a', 'b', 'hi', true)).toEqual({ type: 'speak', text: 'hi', rate: SPEECH_RATE })

  // Make sure SPEECH_RATE is 1.05.
  expect(SPEECH_RATE).toBe(1.05)
})

/** Listen uses a voice the machine already has. Compact and joke voices lose. */
test('listen picks a clear local voice and skips compact and novelty voices', () => {
  // Set up voices.
  const voices = [
    { name: 'Samantha (Compact)', lang: 'en-US', localService: true, default: true },
    { name: 'Fred', lang: 'en-US', localService: true, default: false },
    { name: 'Samantha', lang: 'en-US', localService: true, default: false },
    { name: 'Aaron', lang: 'en-US', localService: true, default: false },
    { name: 'Google US English', lang: 'en-US', localService: false, default: false },
    { name: 'Anna', lang: 'de-DE', localService: true, default: false }
  ]

  // Make sure rankVoice(voices, 'en-US')?.name is 'Samantha'.
  expect(rankVoice(voices, 'en-US')?.name).toBe('Samantha')

  // Make sure rankVoice(voices, 'de-DE')?.name is 'Anna'.
  expect(rankVoice(voices, 'de-DE')?.name).toBe('Anna')

  // Make sure rankVoice([ { name: 'Grandma (Deutsch (Deuts… is 'Samantha'.
  expect(rankVoice([
    { name: 'Grandma (Deutsch (Deutschland))', lang: 'de-DE', localService: true, default: true },
    { name: 'Anna (premium)', lang: 'de-DE', localService: true, default: false },
    { name: 'Samantha', lang: 'en-US', localService: true, default: false },
    { name: 'Eddy (Englisch (Vereinigte Staaten))', lang: 'en-US', localService: true, default: false }
  ], 'en')?.name).toBe('Samantha')

  // Make sure rankVoice([ { name: 'Grandma (Deutsch (Deuts… is 'Anna (premium)'.
  expect(rankVoice([
    { name: 'Grandma (Deutsch (Deutschland))', lang: 'de-DE', localService: true, default: true },
    { name: 'Anna', lang: 'de-DE', localService: true, default: false },
    { name: 'Anna (premium)', lang: 'de-DE', localService: true, default: false }
  ], 'de')?.name).toBe('Anna (premium)')

  // Make sure rankVoice([ { name: 'Samantha (Enhanced)', l… is 'Samantha (Enhanced)'.
  expect(rankVoice([
    { name: 'Samantha (Enhanced)', lang: 'en-US', localService: true, default: false },
    { name: 'Samantha', lang: 'en-US', localService: true, default: true }
  ], 'en-US')?.name).toBe('Samantha (Enhanced)')

  // Make sure speechLang('Start typing and the engine part… is 'en'.
  expect(speechLang('Start typing and the engine partitions your thoughts before the limit.', 'de-DE')).toBe('en')

  // Make sure speechLang('Der Zug ist nicht pünktlich und … is 'de'.
  expect(speechLang('Der Zug ist nicht pünktlich und die Bahn hat Verspätung.', 'en-US')).toBe('de')

  // Make sure speechLang('Hallo zusammen', 'en-US') is 'de'.
  expect(speechLang('Hallo zusammen', 'en-US')).toBe('de')

  // Make sure speechLang('สวัสดีครับ', 'en-US') is 'th'.
  expect(speechLang('สวัสดีครับ', 'en-US')).toBe('th')

  // Make sure speechBcp('de') is 'de-DE'.
  expect(speechBcp('de')).toBe('de-DE')

  // Make sure speechBcp('th') is 'th-TH'.
  expect(speechBcp('th')).toBe('th-TH')

  // Make sure speechBcp('en') is 'en-US'.
  expect(speechBcp('en')).toBe('en-US')

  /** The three sentences the locale files put in the box. */
  const englishSample = JSON.parse(readFileSync(new URL('../i18n/locales/en-US.json', import.meta.url), 'utf8')) as { source: { sample: string } }

  // Set up germanSample.
  const germanSample = JSON.parse(readFileSync(new URL('../i18n/locales/de-DE.json', import.meta.url), 'utf8')) as { source: { sample: string } }

  // Set up thaiSample.
  const thaiSample = JSON.parse(readFileSync(new URL('../i18n/locales/th-TH.json', import.meta.url), 'utf8')) as { source: { sample: string } }

  // Make sure speechLang(englishSample.source.sample, 'de-… is 'en'.
  expect(speechLang(englishSample.source.sample, 'de-DE')).toBe('en')

  // Make sure speechLang(germanSample.source.sample, 'en-U… is 'de'.
  expect(speechLang(germanSample.source.sample, 'en-US')).toBe('de')

  // Make sure speechLang(thaiSample.source.sample, 'en-US') is 'th'.
  expect(speechLang(thaiSample.source.sample, 'en-US')).toBe('th')

  // Make sure rankVoice([ { name: 'Samantha', lang: 'en-US… is 'Anna (premium)'.
  expect(rankVoice([
    { name: 'Samantha', lang: 'en-US', localService: true, default: false },
    { name: 'Anna (premium)', lang: 'de-DE', localService: true, default: false },
    { name: 'Kanya', lang: 'th-TH', localService: true, default: false }
  ], speechLang(germanSample.source.sample, 'en-US'))?.name).toBe('Anna (premium)')

  // Make sure rankVoice([ { name: 'Samantha', lang: 'en-US… is 'Kanya'.
  expect(rankVoice([
    { name: 'Samantha', lang: 'en-US', localService: true, default: false },
    { name: 'Anna (premium)', lang: 'de-DE', localService: true, default: false },
    { name: 'Kanya', lang: 'th-TH', localService: true, default: false }
  ], speechLang(thaiSample.source.sample, 'de-DE'))?.name).toBe('Kanya')

  // Make sure rankVoice([ { name: 'Samantha (Compact)', la… is null.
  expect(rankVoice([
    { name: 'Samantha (Compact)', lang: 'en-US', localService: true, default: true },
    { name: 'Fred', lang: 'en-US', localService: true, default: false }
  ], 'en-US')).toBeNull()

  // Make sure rankVoice([ { name: 'Google US English', lan… is 'Google US English'.
  expect(rankVoice([
    { name: 'Google US English', lang: 'en-US', localService: false, default: false }
  ], 'en-GB')?.name).toBe('Google US English')

  // Make sure rankVoice([], 'en-US') is null.
  expect(rankVoice([], 'en-US')).toBeNull()

  /** The player asks for that ranking. It does not invent a voice object. */
  const player = readFileSync(new URL('../app/composables/useWeaverSpeech.ts', import.meta.url), 'utf8')

  // Make sure player contains 'rankVoice'.
  expect(player).toContain('rankVoice')

  // Make sure player contains 'utterance.lang'.
  expect(player).toContain('utterance.lang')

  // Make sure player contains 'new SpeechSynthesisVoice'.
  expect(player).not.toContain('new SpeechSynthesisVoice')
})

/** The page is the workbench, and it uses these modules rather than a second copy of the rules. */
test('the page imports this module and the starter shell is gone', () => {
  // Set up source.
  const source = vueSource()

  // Set up draft.
  const draft = readFileSync(new URL('../app/composables/useWeaverDraft.ts', import.meta.url), 'utf8')

  // Set up page.
  const page = readFileSync(new URL('../app/pages/index.vue', import.meta.url), 'utf8')

  // Make sure draft contains 'from \'~/utils/weaver/state\''.
  expect(draft).toContain('from \'~/utils/weaver/state\'')

  // Make sure draft contains 'from \'~/utils/weaver/compile\''.
  expect(draft).toContain('from \'~/utils/weaver/compile\'')

  // Make sure page contains '<WeaverHeader'.
  expect(page).toContain('<WeaverHeader')

  // Make sure source contains '<LocaleSwitch'.
  expect(source).toContain('<LocaleSwitch')

  // Make sure source contains 'locale.label'.
  expect(source).toContain('locale.label')

  // Make sure source contains 'ไทย'.
  expect(source).toContain('ไทย')

  // Make sure source contains 'i-ph-hash'.
  expect(source).toContain('i-ph-hash')

  // Make sure source contains 'i-ph-butterfly-fill'.
  expect(source).toContain('i-ph-butterfly-fill')

  // Make sure source contains 'c-chunk-nudge-up'.
  expect(source).toContain('c-chunk-nudge-up')

  // Make sure source contains 'pageDimmed'.
  expect(source).not.toContain('pageDimmed')

  // Make sure source contains 'i-lucide-'.
  expect(source).not.toContain('i-lucide-')

  // Make sure page contains '<WeaverWorkbench'.
  expect(page).toContain('<WeaverWorkbench')

  // Make sure page contains '<PostList'.
  expect(page).toContain('<PostList')

  // Make sure page contains 'components/thread'.
  expect(page).not.toContain('components/thread')

  // Make sure page contains '<ThreadHeader'.
  expect(page).not.toContain('<ThreadHeader')

  // Make sure source contains 'useThreadWeaver'.
  expect(source).toContain('useThreadWeaver')

  // Make sure source contains '<script setup lang="ts">'.
  expect(source).toContain('<script setup lang="ts">')

  // Make sure source contains '$t(\''.
  expect(source).toContain('$t(\'')

  // Make sure source contains SAMPLE_SOURCE.
  expect(source).toContain(SAMPLE_SOURCE)

  // Make sure source contains 'Attention Span Reducer'.
  expect(source).not.toContain('Attention Span Reducer')

  // Make sure source contains 'Nuxt Starter Template'.
  expect(source).not.toContain('Nuxt Starter Template')

  /** Visible copy lives in the locale files, with the same keys in each language. */
  const english = readFileSync(new URL('../i18n/locales/en-US.json', import.meta.url), 'utf8')

  // Set up german.
  const german = JSON.parse(readFileSync(new URL('../i18n/locales/de-DE.json', import.meta.url), 'utf8')) as unknown

  // Set up thai.
  const thai = JSON.parse(readFileSync(new URL('../i18n/locales/th-TH.json', import.meta.url), 'utf8')) as unknown

  // Set up englishMessages.
  const englishMessages = JSON.parse(english) as unknown

  // Set up keys.
  const keys = messageKeys(englishMessages).sort()

  // Make sure messageKeys(german).sort() matches keys.
  expect(messageKeys(german).sort()).toEqual(keys)

  // Make sure messageKeys(thai).sort() matches keys.
  expect(messageKeys(thai).sort()).toEqual(keys)

  // Make sure english contains 'Attention Span Reducer'.
  expect(english).toContain('Attention Span Reducer')

  // Make sure english contains 'THREAD'.
  expect(english).toContain('THREAD')

  // Make sure english contains 'WEAVER'.
  expect(english).toContain('WEAVER')

  // Make sure english contains 'X (280)'.
  expect(english).toContain('X (280)')

  // Make sure english contains 'Bluesky (300)'.
  expect(english).toContain('Bluesky (300)')

  // Make sure english contains 'Threads (500)'.
  expect(english).toContain('Threads (500)')

  // Make sure english contains 'Mastodon (500)'.
  expect(english).toContain('Mastodon (500)')

  // Make sure english contains 'Show Chunk as QR Code'.
  expect(english).toContain('Show Chunk as QR Code')

  // Make sure english contains SAMPLE_SOURCE.
  expect(english).toContain(SAMPLE_SOURCE)

  /** The phone QR is drawn here. The post is not sent to an image host. */
  const modal = readFileSync(new URL('../app/components/QrModal.vue', import.meta.url), 'utf8')

  // Set up publish.
  const publish = readFileSync(new URL('../app/utils/weaver/publish.ts', import.meta.url), 'utf8')

  // Make sure modal contains '<Qrcode'.
  expect(modal).toContain('<Qrcode')

  // Make sure modal contains 'role="dialog"'.
  expect(modal).toContain('role="dialog"')

  // Make sure modal contains 'aria-modal="true"'.
  expect(modal).toContain('aria-modal="true"')

  // Make sure modal contains 'api.qrserver.com'.
  expect(modal).not.toContain('api.qrserver.com')

  // Make sure publish contains 'api.qrserver.com'.
  expect(publish).not.toContain('api.qrserver.com')

  // Make sure modal contains 'httpsd;asdf'.
  expect(modal).not.toContain('httpsd;asdf')

  /** Plus Jakarta is loaded by Nuxt. The page font token is the system UI stack. */
  const css = readFileSync(new URL('../app/assets/css/main.css', import.meta.url), 'utf8')

  // Set up config.
  const config = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')

  // Make sure config contains 'Plus Jakarta Sans'.
  expect(config).toContain('Plus Jakarta Sans')

  // Make sure css contains 'system-ui'.
  expect(css).toContain('system-ui')

  // Make sure css contains 'JetBrains Mono'.
  expect(css).toContain('JetBrains Mono')

  // Make sure css contains '@utility btn-tactile'.
  expect(css).toContain('@utility btn-tactile')

  // Make sure css contains '.thread-chain-move'.
  expect(css).toContain('.thread-chain-move')

  // Make sure css contains '@import "tailwindcss"'.
  expect(css).toContain('@import "tailwindcss"')

  // Make sure css contains '@import "@nuxt/ui"'.
  expect(css).toContain('@import "@nuxt/ui"')
})
