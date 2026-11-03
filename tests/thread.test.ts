/** Bun's test runner. */
import { expect, test } from 'bun:test'

/** Read the files the page is built from. */
import { readFileSync, readdirSync } from 'node:fs'

/** Join a directory and a file name. */
import { join } from 'node:path'

/** Turn chunks into posts. */
import { compileThread } from '../app/utils/weaver/compile.ts'

/** Sample text, copy delay, and speech rate. */
import { COPY_ALL_RESET_MS, SAMPLE_SOURCE, SPEECH_RATE } from '../app/utils/weaver/limits.ts'

/** Totals, read time, and the ring color. */
import { readTimeMinutes, ringColor, ringTextColor, totalChars, totalWords } from '../app/utils/weaver/metrics.ts'

/** Copy-all, markdown, intents, and the QR address. */
import { copyAllBody, intentUrl, markdownBody, markdownFilename } from '../app/utils/weaver/publish.ts'

/** Speech decision, voice choice, and the copy-all timer. */
import { armCopyAllReset, rankVoice, speechBcp, speechCommand, speechLang } from '../app/utils/weaver/speech.ts'

/** Normalize and pack. */
import { splitSource } from '../app/utils/weaver/split.ts'

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
} from '../app/utils/weaver/state.ts'

/** The four limits. */
import { PLATFORM_LIMITS } from '../app/utils/weaver/types.ts'

/** Marker and placement names. */
import type { MarkerFormat, MarkerPlacement } from '../app/utils/weaver/types.ts'

/** Two short chunks used by the marker table. */
const BLOCKS = [
  { id: 'block-0', text: 'Alpha' },
  { id: 'block-1', text: 'Beta' }
]

/** Compile those two chunks with one marker setup. */
function compilePair(marker: MarkerFormat, placement: MarkerPlacement, bridge = '') {
  return compileThread({ blocks: BLOCKS, marker, placement, bridge })
}

/** Read every file in a folder that ends with the given suffix. */
function readMatching(directory: URL, suffix: string): string[] {
  return readdirSync(directory)
    .filter(name => name.endsWith(suffix))
    .map(name => readFileSync(join(directory.pathname, name), 'utf8'))
}

/** Dot paths of every string in a locale file. */
function messageKeys(value: unknown, prefix = ''): string[] {
  /** A leaf is one message. */
  if (typeof value === 'string') {
    return [prefix]
  }

  /** Numbers and null are not copy. */
  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    /** `header.kicker`, and so on. */
    const path = prefix ? `${prefix}.${key}` : key

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

  chunks.push(...readMatching(new URL('../app/components/', import.meta.url), '.vue'))

  chunks.push(...readMatching(new URL('../app/composables/', import.meta.url), '.ts'))

  chunks.push(...readMatching(new URL('../app/utils/weaver/', import.meta.url), '.ts'))

  return chunks.join('\n')
}

/** A fresh editor is X, 280, parentheses, and the sample sentence in one card. */
test('default state splits the sample on the X budget', () => {
  const state = createWeaverState()
  expect(state.source).toBe(SAMPLE_SOURCE)
  expect(state.platform).toBe('x')
  expect(state.limit).toBe(280)
  expect(state.marker).toBe('parens')
  expect(state.placement).toBe('newline')
  expect(state.bridge).toBe('')
  expect(state.capitalize).toBe(false)
  expect(state.finishSentences).toBe(false)
  expect(state.keepBreaks).toBe(false)
  expect(PLATFORM_LIMITS.x).toBe(280)
  expect(PLATFORM_LIMITS.bsky).toBe(300)
  expect(PLATFORM_LIMITS.threads).toBe(500)
  expect(PLATFORM_LIMITS.masto).toBe(500)
  expect(state.source.includes('Segment 1 of your unhinged monologue sits right here')).toBe(true)
  expect(state.blocks.length).toBe(1)
  expect(state.blocks[0]?.id).toBe('block-0')
  const posts = compileThread(state)
  expect(posts[0]?.compiled).toBe(`${SAMPLE_SOURCE}\n\n(1/1)`)
  expect(totalChars(posts)).toBe(posts[0]?.compiled.length)
  expect(totalWords(SAMPLE_SOURCE)).toBe(29)
  expect(readTimeMinutes(totalWords(SAMPLE_SOURCE))).toBe(1)
})

/** Words stay whole. One huge token is allowed to stick out past the limit. */
test('packs on whitespace without cutting a word, except one over-long token', () => {
  const long = Array.from({ length: 80 }, () => 'word').join(' ')
  expect(long.length).toBeGreaterThan(280)
  const blocks = splitSource(long, 280, '', false)
  expect(blocks.length).toBe(2)
  expect(blocks.map(block => block.id)).toEqual(['block-0', 'block-1'])
  expect(blocks.every(block => block.text.length <= 280 - 16)).toBe(true)
  expect(blocks.map(block => block.text).join(' ')).toBe(long)
  for (const block of blocks) {
    for (const part of block.text.split(' ')) {
      expect(part).toBe('word')
    }
  }

  const token = 'Z'.repeat(300)
  const mixed = splitSource(`hello ${token} world`, 280, '', false)
  expect(mixed.map(block => block.text)).toEqual(['hello', token, 'world'])
  expect(mixed[1]?.text.length ?? 0).toBeGreaterThan(280)
})

/** Each platform has its own cap, and a long string splits differently under them. */
test('platforms change the limit and the segment count', () => {
  const letters = Array.from({ length: 400 }, () => 'a').join(' ')
  let state = createWeaverState(letters)
  expect(state.limit).toBe(280)
  expect(state.blocks.length).toBe(4)

  state = setPlatform(state, 'bsky')
  expect(state.platform).toBe('bsky')
  expect(state.limit).toBe(300)
  expect(state.blocks.length).toBe(3)

  state = setPlatform(state, 'threads')
  expect(state.platform).toBe('threads')
  expect(state.limit).toBe(500)
  expect(state.blocks.length).toBe(2)

  state = setPlatform(state, 'masto')
  expect(state.platform).toBe('masto')
  expect(state.limit).toBe(500)
  expect(state.blocks.length).toBe(2)

  for (const block of state.blocks) {
    expect(block.text.length).toBeLessThanOrEqual(500 - 16)
    expect(block.text.split(' ').every(part => part === 'a')).toBe(true)
  }
})

/** Every marker and placement produces the exact string we publish. */
test('marker formats and placements match the compiled strings', () => {
  const cases: Array<[MarkerFormat, MarkerPlacement, string, string, string]> = [
    ['parens', 'newline', '', 'Alpha\n\n(1/2)', 'Beta\n\n(2/2)'],
    ['parens', 'inline-after', '', 'Alpha (1/2)', 'Beta (2/2)'],
    ['parens', 'inline-before', '', '(1/2) Alpha', '(2/2) Beta'],
    ['parens', 'start', '', '(1/2)\n\nAlpha', '(2/2)\n\nBeta'],
    ['brackets', 'newline', '', 'Alpha\n\n[1/2]', 'Beta\n\n[2/2]'],
    ['brackets', 'inline-after', '', 'Alpha [1/2]', 'Beta [2/2]'],
    ['brackets', 'inline-before', '', '[1/2] Alpha', '[2/2] Beta'],
    ['brackets', 'start', '', '[1/2]\n\nAlpha', '[2/2]\n\nBeta'],
    ['slash', 'newline', '', 'Alpha\n\n1/2', 'Beta\n\n2/2'],
    ['slash', 'inline-after', '', 'Alpha 1/2', 'Beta 2/2'],
    ['slash', 'inline-before', '', '1/2 Alpha', '2/2 Beta'],
    ['slash', 'start', '', '1/2\n\nAlpha', '2/2\n\nBeta'],
    ['hash', 'newline', '', 'Alpha\n\n#1', 'Beta\n\n#2'],
    ['hash', 'inline-after', '', 'Alpha #1', 'Beta #2'],
    ['hash', 'inline-before', '', '#1 Alpha', '#2 Beta'],
    ['hash', 'start', '', '#1\n\nAlpha', '#2\n\nBeta'],
    ['none', 'newline', '', 'Alpha', 'Beta'],
    ['none', 'inline-after', '', 'Alpha', 'Beta'],
    ['none', 'inline-before', '', 'Alpha', 'Beta'],
    ['none', 'start', '', 'Alpha', 'Beta'],
    ['parens', 'inline-after', '//', 'Alpha // (1/2)', 'Beta // (2/2)'],
    ['parens', 'inline-before', '//', '(1/2) // Alpha', '(2/2) // Beta'],
    ['parens', 'newline', '//', 'Alpha\n\n//\n\n(1/2)', 'Beta\n\n//\n\n(2/2)'],
    ['parens', 'start', '>>', '(1/2)\n\n>>\n\nAlpha', '(2/2)\n\n>>\n\nBeta'],
    ['none', 'inline-after', '//', 'Alpha', 'Beta']
  ]

  for (const [marker, placement, bridge, first, second] of cases) {
    const posts = compilePair(marker, placement, bridge)
    expect(posts[0]?.compiled).toBe(first)
    expect(posts[1]?.compiled).toBe(second)
  }
})

/** Listen reads the card, and it skips the chunk counter. */
test('listen reads the post without the chunk counter', () => {
  const cases: Array<[MarkerFormat, MarkerPlacement, string, string, string]> = [
    ['parens', 'newline', '', 'Alpha', 'Beta'],
    ['parens', 'inline-after', '', 'Alpha', 'Beta'],
    ['parens', 'inline-before', '', 'Alpha', 'Beta'],
    ['parens', 'start', '', 'Alpha', 'Beta'],
    ['brackets', 'newline', '', 'Alpha', 'Beta'],
    ['brackets', 'inline-after', '', 'Alpha', 'Beta'],
    ['brackets', 'inline-before', '', 'Alpha', 'Beta'],
    ['brackets', 'start', '', 'Alpha', 'Beta'],
    ['slash', 'newline', '', 'Alpha', 'Beta'],
    ['slash', 'inline-after', '', 'Alpha', 'Beta'],
    ['slash', 'inline-before', '', 'Alpha', 'Beta'],
    ['slash', 'start', '', 'Alpha', 'Beta'],
    ['hash', 'newline', '', 'Alpha', 'Beta'],
    ['hash', 'inline-after', '', 'Alpha', 'Beta'],
    ['hash', 'inline-before', '', 'Alpha', 'Beta'],
    ['hash', 'start', '', 'Alpha', 'Beta'],
    ['none', 'newline', '', 'Alpha', 'Beta'],
    ['parens', 'inline-after', '//', 'Alpha //', 'Beta //'],
    ['parens', 'inline-before', '//', '// Alpha', '// Beta'],
    ['parens', 'newline', '//', 'Alpha\n\n//', 'Beta\n\n//'],
    ['parens', 'start', '>>', '>>\n\nAlpha', '>>\n\nBeta'],
    ['brackets', 'newline', '...', 'Alpha\n\n...', 'Beta\n\n...'],
    ['none', 'inline-after', '//', 'Alpha', 'Beta']
  ]

  for (const [marker, placement, bridge, first, second] of cases) {
    const posts = compilePair(marker, placement, bridge)
    expect(posts[0]?.spoken).toBe(first)
    expect(posts[1]?.spoken).toBe(second)
  }

  /** A counter written inside the post stays. Only the one we attach is dropped. */
  const quoted = compileThread({
    blocks: [{ id: 'block-0', text: 'See [1/2] in the notes' }],
    marker: 'brackets',
    placement: 'newline',
    bridge: ''
  })

  expect(quoted[0]?.compiled).toBe('See [1/2] in the notes\n\n[1/1]')
  expect(quoted[0]?.spoken).toBe('See [1/2] in the notes')

  /** An empty card has nothing to say once the counter is gone. */
  const empty = compileThread(setSource(createWeaverState(), ''))
  expect(empty[0]?.spoken).toBe('')

  /** The button passes that string straight into the speech decision. */
  const spoken = compilePair('brackets', 'newline')[0]?.spoken ?? ''
  expect(spoken).toBe('Alpha')
  expect(speechCommand(true, null, 'block-0', spoken, false)).toEqual({
    type: 'speak',
    text: 'Alpha',
    rate: SPEECH_RATE
  })

  /** The Listen click uses the spoken string, not the card that still shows the counter. */
  const actions = readFileSync(new URL('../app/components/PostActions.vue', import.meta.url), 'utf8')
  expect(actions).toContain('weaver.listen(post.spoken, post.id)')
})

/** Typing a bridge shows it on the default layout without another control change. */
test('typing a bridge updates the default newline preview immediately', () => {
  const fresh = createWeaverState()
  const withDots = setBridge(fresh, '...')
  expect(withDots.placement).toBe('newline')
  expect(withDots.blocks.map(block => block.text)).toEqual(fresh.blocks.map(block => block.text))
  expect(compileThread(withDots)[0]?.compiled).toBe(`${SAMPLE_SOURCE}\n\n...\n\n(1/1)`)

  const swapped = setBridge(withDots, '???')
  expect(swapped.blocks.map(block => block.id)).toEqual(withDots.blocks.map(block => block.id))
  expect(compileThread(swapped)[0]?.compiled).toBe(`${SAMPLE_SOURCE}\n\n???\n\n(1/1)`)
  expect(compileThread(swapped)[0]?.compiled.includes('...')).toBe(false)
})

/** A longer bridge leaves less room in each chunk and changes the inline gap. */
test('a longer bridge shrinks the packing budget and changes the inline joiner', () => {
  const hi = Array.from({ length: 83 }, () => 'hi').join(' ')
  expect(hi.length).toBe(248)
  expect(splitSource(hi, 280, '', false).length).toBe(1)
  const bridged = splitSource(hi, 280, 'x'.repeat(20), false)
  expect(bridged.length).toBe(2)
  expect(bridged.every(block => block.text.length <= 280 - 16 - 20)).toBe(true)
  expect(bridged.map(block => block.text).join(' ')).toBe(hi)

  const posts = compilePair('parens', 'inline-after', '>>')
  expect(posts[0]?.compiled).toBe('Alpha >> (1/2)')
})

/** Capitalize, finish sentences, and keep line breaks change the published text. */
test('text tools capitalize, close a sentence, and keep a line break', () => {
  const plain = setSource(createWeaverState(), 'alpha beta')
  const capitalized = setCapitalize(plain, true)
  expect(capitalized.blocks[0]?.text).toBe('alpha beta')
  expect(compileThread(capitalized)[0]?.compiled.startsWith('Alpha beta')).toBe(true)

  const closed = setFinishSentences(setSource(createWeaverState(), 'Hello'), true)
  expect(compileThread(closed)[0]?.raw).toBe('Hello…')
  const already = setFinishSentences(setSource(createWeaverState(), 'Hello.'), true)
  expect(compileThread(already)[0]?.raw).toBe('Hello.')

  expect(splitSource('hello\n\nworld', 280, '', false)[0]?.text).toBe('hello world')
  expect(splitSource('hello\n\nworld', 280, '', true)[0]?.text).toBe('hello\n\nworld')
  const kept = setKeepBreaks(setSource(createWeaverState(), 'hello\nworld'), true)
  expect(kept.blocks[0]?.text).toBe('hello\nworld')
})

/** A blank box is one empty card, not zero cards. */
test('empty input yields one empty segment', () => {
  expect(splitSource('', 280, '', false)).toEqual([{ id: 'b-0', text: '' }])
  expect(splitSource('  \n\t ', 280, '', true)).toEqual([{ id: 'b-0', text: '' }])
  const state = setSource(createWeaverState(), '')
  expect(state.blocks).toEqual([{ id: 'b-0', text: '' }])
  expect(totalWords('')).toBe(0)
  expect(totalWords('   ')).toBe(0)
  expect(compileThread(state)[0]?.compiled).toBe('\n\n(1/1)')
})

/** Reorder and drop stick until a pack-again edit throws that order away. */
test('move and drop keep segment text until source, line breaks, platform, or bridge length changes', () => {
  const numbered = Array.from({ length: 80 }, (_, index) => `w${String(index).padStart(2, '0')}`).join(' ')
  const original = createWeaverState(numbered)
  expect(original.blocks.length).toBeGreaterThan(1)
  const originalText = original.blocks.map(block => block.text)

  let state = moveSegment(original, 0, 1)
  const moved = state.blocks.map(block => block.text)
  expect(moved).toEqual([originalText[1], originalText[0], ...originalText.slice(2)])
  expect(moveSegment(state, 0, -1).blocks[0]?.text).toBe(originalText[1])

  state = setMarker(state, 'hash')
  state = setPlacement(state, 'start')
  expect(state.blocks.map(block => block.text)).toEqual(moved)
  expect(compileThread(state)[0]?.compiled).toBe(`#1\n\n${moved[0]}`)

  state = setSource(state, numbered)
  expect(state.blocks.map(block => block.text)).toEqual(originalText)

  state = moveSegment(createWeaverState(numbered), 0, 1)
  state = setKeepBreaks(state, true)
  expect(state.blocks.map(block => block.text)).toEqual(originalText)

  state = moveSegment(createWeaverState(numbered), 0, 1)
  const movedBeforePlatform = state.blocks.map(block => block.id)
  state = setPlatform(state, 'bsky')
  expect(state.limit).toBe(300)
  expect(state.blocks.map(block => block.id)).not.toEqual(movedBeforePlatform)
  expect(state.blocks.map(block => block.text)).toEqual(
    setPlatform(createWeaverState(numbered), 'bsky').blocks.map(block => block.text)
  )

  state = moveSegment(createWeaverState(numbered), 0, 1)
  const movedText = state.blocks.map(block => block.text)
  state = setBridge(state, '>>>')
  expect(state.blocks.map(block => block.text)).not.toEqual(movedText)
  expect(state.blocks.map(block => block.text)).toEqual(
    setBridge(createWeaverState(numbered), '>>>').blocks.map(block => block.text)
  )

  state = setBridge(createWeaverState(numbered), 'ab')
  state = moveSegment(state, 0, 1)
  const sameLengthOrder = state.blocks.map(block => block.text)
  state = setBridge(state, 'cd')
  state = setPlacement(state, 'inline-after')
  expect(state.blocks.map(block => block.text)).toEqual(sameLengthOrder)
  expect(compileThread(state)[0]?.compiled.includes(' cd ')).toBe(true)

  const beforeDrop = createWeaverState(numbered).blocks.map(block => block.text)
  const dropped = dropSegment(createWeaverState(numbered), 1)
  expect(dropped.blocks.map(block => block.text)).toEqual([beforeDrop[0], ...beforeDrop.slice(2)])
  expect(dropped.blocks.some(block => block.text === beforeDrop[1])).toBe(false)
})

/** Copy, download, send, QR, the ring, read time, and Listen all use the published text. */
test('copy-all, markdown, filenames, intents, QR, ring color, read time, and speech payloads', () => {
  const posts = compilePair('parens', 'newline')
  expect(copyAllBody(posts)).toBe('Alpha\n\n(1/2)\n\n---\n\nBeta\n\n(2/2)')
  expect(markdownBody(posts)).toBe('### Post 1\n\nAlpha\n\n(1/2)\n\n---\n\n### Post 2\n\nBeta\n\n(2/2)')
  expect(markdownFilename('x', 1710000000000)).toBe('thread-x-1710000000000.md')
  expect(markdownFilename('bsky', 5)).toMatch(/^thread-bsky-.*\.md$/)
  expect(markdownFilename('threads', 5)).toMatch(/^thread-threads-.*\.md$/)
  expect(markdownFilename('masto', 5)).toMatch(/^thread-masto-.*\.md$/)

  const compiled = 'Alpha\n\n(1/2)'
  expect(intentUrl('x', compiled)).toBe(`https://x.com/intent/tweet?text=${encodeURIComponent(compiled)}`)
  expect(intentUrl('bsky', compiled)).toBe(`https://bsky.app/intent/compose?text=${encodeURIComponent(compiled)}`)
  expect(intentUrl('threads', compiled)).toBe(`https://www.threads.net/intent/post?text=${encodeURIComponent(compiled)}`)
  expect(intentUrl('masto', compiled)).toBe(`https://mastodon.social/share?text=${encodeURIComponent(compiled)}`)

  expect(ringColor(281, 280)).toBe('hsl(0, 90%, 45%)')
  expect(ringColor(0, 280)).toBe('hsl(140, 80%, 42%)')
  const ratio = Math.min(1, Math.max(0, 100 / 280))
  expect(ringColor(100, 280)).toBe(`hsl(${(1 - ratio) * 140}, 80%, 42%)`)
  expect(ringColor(280, 280)).toBe('hsl(0, 80%, 42%)')
  expect(ringTextColor(281, 280)).toBe('hsl(0, 90%, 45%)')
  expect(ringTextColor(0, 280)).toBe('hsl(140, 80%, 26%)')
  expect(ringTextColor(100, 280)).toBe(`hsl(${(1 - ratio) * 140}, 80%, 26%)`)

  expect(readTimeMinutes(0)).toBe(1)
  expect(readTimeMinutes(100)).toBe(1)
  expect(readTimeMinutes(200)).toBe(1)
  expect(readTimeMinutes(300)).toBe(2)
  expect(totalWords('  a  b \n c ')).toBe(3)
  expect(totalChars(posts)).toBe('Alpha\n\n(1/2)'.length + 'Beta\n\n(2/2)'.length)

  const events: boolean[] = []
  let delay = 0
  let queued: (() => void) | undefined
  armCopyAllReset((copied) => {
    events.push(copied)
  }, (fn, ms) => {
    delay = ms
    queued = fn
  })
  expect(events).toEqual([true])
  expect(delay).toBe(COPY_ALL_RESET_MS)
  expect(delay).toBe(2500)
  expect(queued).toBeDefined()
  queued?.()
  expect(events).toEqual([true, false])

  expect(speechCommand(false, null, 'a', 'hi', false)).toEqual({ type: 'noop' })
  expect(speechCommand(true, 'a', 'a', 'hi', true)).toEqual({ type: 'cancel' })
  expect(speechCommand(true, 'a', 'b', 'hi', true)).toEqual({ type: 'speak', text: 'hi', rate: SPEECH_RATE })
  expect(SPEECH_RATE).toBe(1.05)
})

/** Listen uses a voice the machine already has. Compact and joke voices lose. */
test('listen picks a clear local voice and skips compact and novelty voices', () => {
  const voices = [
    { name: 'Samantha (Compact)', lang: 'en-US', localService: true, default: true },
    { name: 'Fred', lang: 'en-US', localService: true, default: false },
    { name: 'Samantha', lang: 'en-US', localService: true, default: false },
    { name: 'Aaron', lang: 'en-US', localService: true, default: false },
    { name: 'Google US English', lang: 'en-US', localService: false, default: false },
    { name: 'Anna', lang: 'de-DE', localService: true, default: false }
  ]

  expect(rankVoice(voices, 'en-US')?.name).toBe('Samantha')
  expect(rankVoice(voices, 'de-DE')?.name).toBe('Anna')
  expect(rankVoice([
    { name: 'Grandma (Deutsch (Deutschland))', lang: 'de-DE', localService: true, default: true },
    { name: 'Anna (premium)', lang: 'de-DE', localService: true, default: false },
    { name: 'Samantha', lang: 'en-US', localService: true, default: false },
    { name: 'Eddy (Englisch (Vereinigte Staaten))', lang: 'en-US', localService: true, default: false }
  ], 'en')?.name).toBe('Samantha')
  expect(rankVoice([
    { name: 'Grandma (Deutsch (Deutschland))', lang: 'de-DE', localService: true, default: true },
    { name: 'Anna', lang: 'de-DE', localService: true, default: false },
    { name: 'Anna (premium)', lang: 'de-DE', localService: true, default: false }
  ], 'de')?.name).toBe('Anna (premium)')
  expect(rankVoice([
    { name: 'Samantha (Enhanced)', lang: 'en-US', localService: true, default: false },
    { name: 'Samantha', lang: 'en-US', localService: true, default: true }
  ], 'en-US')?.name).toBe('Samantha (Enhanced)')
  expect(speechLang('Start typing and the engine partitions your thoughts before the limit.', 'de-DE')).toBe('en')
  expect(speechLang('Der Zug ist nicht pünktlich und die Bahn hat Verspätung.', 'en-US')).toBe('de')
  expect(speechLang('Hallo zusammen', 'en-US')).toBe('de')
  expect(speechLang('สวัสดีครับ', 'en-US')).toBe('th')
  expect(speechBcp('de')).toBe('de-DE')
  expect(speechBcp('th')).toBe('th-TH')
  expect(speechBcp('en')).toBe('en-US')

  /** The three sentences the locale files put in the box. */
  const englishSample = JSON.parse(readFileSync(new URL('../i18n/locales/en-US.json', import.meta.url), 'utf8')) as { source: { sample: string } }
  const germanSample = JSON.parse(readFileSync(new URL('../i18n/locales/de-DE.json', import.meta.url), 'utf8')) as { source: { sample: string } }
  const thaiSample = JSON.parse(readFileSync(new URL('../i18n/locales/th-TH.json', import.meta.url), 'utf8')) as { source: { sample: string } }

  expect(speechLang(englishSample.source.sample, 'de-DE')).toBe('en')
  expect(speechLang(germanSample.source.sample, 'en-US')).toBe('de')
  expect(speechLang(thaiSample.source.sample, 'en-US')).toBe('th')
  expect(rankVoice([
    { name: 'Samantha', lang: 'en-US', localService: true, default: false },
    { name: 'Anna (premium)', lang: 'de-DE', localService: true, default: false },
    { name: 'Kanya', lang: 'th-TH', localService: true, default: false }
  ], speechLang(germanSample.source.sample, 'en-US'))?.name).toBe('Anna (premium)')
  expect(rankVoice([
    { name: 'Samantha', lang: 'en-US', localService: true, default: false },
    { name: 'Anna (premium)', lang: 'de-DE', localService: true, default: false },
    { name: 'Kanya', lang: 'th-TH', localService: true, default: false }
  ], speechLang(thaiSample.source.sample, 'de-DE'))?.name).toBe('Kanya')
  expect(rankVoice([
    { name: 'Samantha (Compact)', lang: 'en-US', localService: true, default: true },
    { name: 'Fred', lang: 'en-US', localService: true, default: false }
  ], 'en-US')).toBeNull()
  expect(rankVoice([
    { name: 'Google US English', lang: 'en-US', localService: false, default: false }
  ], 'en-GB')?.name).toBe('Google US English')
  expect(rankVoice([], 'en-US')).toBeNull()

  /** The player asks for that ranking. It does not invent a voice object. */
  const player = readFileSync(new URL('../app/composables/useWeaverSpeech.ts', import.meta.url), 'utf8')
  expect(player).toContain('rankVoice')
  expect(player).toContain('utterance.lang')
  expect(player).not.toContain('new SpeechSynthesisVoice')
})

/** The page is the workbench, and it uses these modules rather than a second copy of the rules. */
test('the page imports this module and the starter shell is gone', () => {
  const source = vueSource()
  const draft = readFileSync(new URL('../app/composables/useWeaverDraft.ts', import.meta.url), 'utf8')
  const page = readFileSync(new URL('../app/pages/index.vue', import.meta.url), 'utf8')
  expect(draft).toContain('from \'~/utils/weaver/state\'')
  expect(draft).toContain('from \'~/utils/weaver/compile\'')
  expect(page).toContain('<WeaverHeader')
  expect(source).toContain('<LocaleSwitch')
  expect(source).toContain('locale.label')
  expect(source).toContain('ไทย')
  expect(source).toContain('i-ph-hash')
  expect(source).toContain('i-ph-butterfly-fill')
  expect(source).toContain('c-chunk-nudge-up')
  expect(source).not.toContain('pageDimmed')
  expect(source).not.toContain('i-lucide-')
  expect(page).toContain('<WeaverWorkbench')
  expect(page).toContain('<PostList')
  expect(page).not.toContain('components/thread')
  expect(page).not.toContain('<ThreadHeader')
  expect(source).toContain('useThreadWeaver')
  expect(source).toContain('<script setup lang="ts">')
  expect(source).toContain('$t(\'')
  expect(source).toContain(SAMPLE_SOURCE)
  expect(source).not.toContain('Attention Span Reducer')
  expect(source).not.toContain('Nuxt Starter Template')

  /** Visible copy lives in the locale files, with the same keys in each language. */
  const english = readFileSync(new URL('../i18n/locales/en-US.json', import.meta.url), 'utf8')
  const german = JSON.parse(readFileSync(new URL('../i18n/locales/de-DE.json', import.meta.url), 'utf8')) as unknown
  const thai = JSON.parse(readFileSync(new URL('../i18n/locales/th-TH.json', import.meta.url), 'utf8')) as unknown
  const englishMessages = JSON.parse(english) as unknown
  const keys = messageKeys(englishMessages).sort()

  expect(messageKeys(german).sort()).toEqual(keys)
  expect(messageKeys(thai).sort()).toEqual(keys)
  expect(english).toContain('Attention Span Reducer')
  expect(english).toContain('THREAD')
  expect(english).toContain('WEAVER')
  expect(english).toContain('X (280)')
  expect(english).toContain('Bluesky (300)')
  expect(english).toContain('Threads (500)')
  expect(english).toContain('Mastodon (500)')
  expect(english).toContain('Show Chunk as QR Code')
  expect(english).toContain(SAMPLE_SOURCE)

  /** The phone QR is drawn here. The post is not sent to an image host. */
  const modal = readFileSync(new URL('../app/components/QrModal.vue', import.meta.url), 'utf8')
  const publish = readFileSync(new URL('../app/utils/weaver/publish.ts', import.meta.url), 'utf8')

  expect(modal).toContain('<Qrcode')
  expect(modal).toContain('role="dialog"')
  expect(modal).toContain('aria-modal="true"')
  expect(modal).not.toContain('api.qrserver.com')
  expect(publish).not.toContain('api.qrserver.com')
  expect(modal).not.toContain('httpsd;asdf')

  /** Plus Jakarta is loaded by Nuxt. The page font token is the system UI stack. */
  const css = readFileSync(new URL('../app/assets/css/main.css', import.meta.url), 'utf8')
  const config = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
  expect(config).toContain('Plus Jakarta Sans')
  expect(css).toContain('system-ui')
  expect(css).toContain('JetBrains Mono')
  expect(css).toContain('@utility btn-tactile')
  expect(css).toContain('.thread-chain-move')
  expect(css).toContain('@import "tailwindcss"')
  expect(css).toContain('@import "@nuxt/ui"')
})
