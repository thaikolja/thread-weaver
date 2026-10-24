import { expect, test } from 'bun:test'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  COPY_ALL_RESET_MS,
  PLATFORM_LIMITS,
  SAMPLE_SOURCE,
  SPEECH_RATE,
  armCopyAllReset,
  compileThread,
  copyAllBody,
  createWeaverState,
  dropSegment,
  intentUrl,
  markdownBody,
  markdownFilename,
  moveSegment,
  prepareSource,
  qrImageUrl,
  readTimeMinutes,
  ringColor,
  setBridge,
  setFlatten,
  setMarker,
  setPlacement,
  setPlatform,
  setSource,
  speechCommand,
  splitSource,
  totalChars,
  totalWords
} from '../app/utils/thread.ts'
import type { MarkerFormat, MarkerPlacement } from '../app/utils/thread.ts'

const BLOCKS = [
  { id: 'block-0', text: 'Alpha' },
  { id: 'block-1', text: 'Beta' }
]

function compilePair(marker: MarkerFormat, placement: MarkerPlacement, bridge = '') {
  return compileThread({ blocks: BLOCKS, marker, placement, bridge })
}

function vueSource(): string {
  const files = [
    new URL('../app/pages/index.vue', import.meta.url),
    new URL('../app/app.vue', import.meta.url),
    new URL('../app/layouts/default.vue', import.meta.url),
    new URL('../app/composables/useThreadWeaver.ts', import.meta.url)
  ]
  const threadDir = new URL('../app/components/thread/', import.meta.url)
  const componentFiles = readdirSync(threadDir).filter(name => name.endsWith('.vue'))
  const chunks = files.map(file => readFileSync(file, 'utf8'))
  for (const name of componentFiles) {
    chunks.push(readFileSync(join(threadDir.pathname, name), 'utf8'))
  }
  chunks.push(readFileSync(new URL('../app/utils/thread.ts', import.meta.url), 'utf8'))
  return chunks.join('\n')
}

test('default state splits the sample on the X budget', () => {
  const state = createWeaverState()
  expect(state.source).toBe(SAMPLE_SOURCE)
  expect(state.platform).toBe('x')
  expect(state.limit).toBe(280)
  expect(state.marker).toBe('parens')
  expect(state.placement).toBe('newline')
  expect(state.bridge).toBe('')
  expect(state.flatten).toBe(false)
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
    ['parens', 'newline', '//', 'Alpha\n\n(1/2)', 'Beta\n\n(2/2)'],
    ['parens', 'start', '>>', '(1/2)\n\nAlpha', '(2/2)\n\nBeta'],
    ['none', 'inline-after', '//', 'Alpha', 'Beta']
  ]

  for (const [marker, placement, bridge, first, second] of cases) {
    const posts = compilePair(marker, placement, bridge)
    expect(posts[0]?.compiled).toBe(first)
    expect(posts[1]?.compiled).toBe(second)
  }
})

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

test('flatten collapses a blank line before packing', () => {
  expect(prepareSource('a\n\n\nb\t\tc', true)).toBe('a\nb c')
  expect(prepareSource('  a\n\n\nb\t\tc  ', true)).toBe('a\nb c')
  expect(prepareSource('a  b', false)).toBe('a  b')
  expect(prepareSource('a  b', true)).toBe('a b')
  expect(splitSource('keep\n\n\nthis   together', 280, '', true)[0]?.text).toBe('keep this together')
})

test('empty input yields one empty segment', () => {
  expect(splitSource('', 280, '', false)).toEqual([{ id: 'b-0', text: '' }])
  expect(splitSource('  \n\t ', 280, '', true)).toEqual([{ id: 'b-0', text: '' }])
  const state = setSource(createWeaverState(), '')
  expect(state.blocks).toEqual([{ id: 'b-0', text: '' }])
  expect(totalWords('')).toBe(0)
  expect(totalWords('   ')).toBe(0)
  expect(compileThread(state)[0]?.compiled).toBe('\n\n(1/1)')
})

test('move and drop keep segment text until source, flatten, platform, or bridge length changes', () => {
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
  state = setFlatten(state, true)
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
  expect(qrImageUrl(compiled)).toBe(
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(compiled)}`
  )

  expect(ringColor(281, 280)).toBe('hsl(0, 90%, 45%)')
  expect(ringColor(0, 280)).toBe('hsl(140, 80%, 42%)')
  const ratio = Math.min(1, Math.max(0, 100 / 280))
  expect(ringColor(100, 280)).toBe(`hsl(${(1 - ratio) * 140}, 80%, 42%)`)
  expect(ringColor(280, 280)).toBe('hsl(0, 80%, 42%)')

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

test('the page imports this module and the starter shell is gone', () => {
  const source = vueSource()
  const composable = readFileSync(new URL('../app/composables/useThreadWeaver.ts', import.meta.url), 'utf8')
  expect(composable).toContain('from \'~/utils/thread\'')
  expect(source).toContain('useThreadWeaver')
  expect(source).toContain('<script setup lang="ts">')
  expect(source).toContain('Attention Span Reducer')
  expect(source).toContain('THREAD')
  expect(source).toContain('WEAVER')
  expect(source).toContain('X (280)')
  expect(source).toContain('Bluesky (300)')
  expect(source).toContain('Threads (500)')
  expect(source).toContain('Mastodon (500)')
  expect(source).toContain('Segment 1 of your unhinged monologue sits right here')
  expect(source).not.toContain('Nuxt Starter Template')
  const css = readFileSync(new URL('../app/assets/css/main.css', import.meta.url), 'utf8')
  expect(css).toContain('Plus Jakarta Sans')
  expect(css).toContain('JetBrains Mono')
  expect(css).toContain('@utility btn-tactile')
  expect(css).toContain('.thread-chain-move')
  expect(css).toContain('@import "tailwindcss"')
  expect(css).toContain('@import "@nuxt/ui"')
})
