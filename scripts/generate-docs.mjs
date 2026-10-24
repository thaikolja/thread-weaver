/** Read and write the documentation pages. */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repository root, one level above this script. */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** VitePress source at the repository root. */
const contentDir = join(root, 'docs')

/** Logo and other files VitePress copies through as-is. */
const docsPublic = join(contentDir, 'public')

/** Write one markdown page, creating parent folders as needed. */
function writePage(relativePath, body) {
  const target = join(contentDir, relativePath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, body.trimStart())
}

/** Turn a block comment into plain sentences, including @param lines. */
function formatDoc(raw) {
  /** Comment body with the star prefix removed. */
  const cleaned = raw
    .replace(/^\/\*\*/, '')
    .replace(/\*\/\s*$/, '')
    .replace(/^\s*\*\s?/gm, '')
    .trim()

  /** Lines of the comment, with tags rewritten as short bullets. */
  const mapped = cleaned.split('\n').map((line) => {
    /** `@param name rest` becomes a short parameter line. */
    const param = line.match(/^@param\s+(\S+)\s+(.*)$/)
    if (param) {
      return `- Parameter \`${param[1]}\`: ${param[2]}`
    }

    /** `@returns` becomes a short result line. */
    const returns = line.match(/^@returns?\s+(.*)$/)
    if (returns) {
      return `- Returns: ${returns[1]}`
    }

    return line.trim()
  })

  /** Paragraphs, so a wrapped sentence stays one sentence. */
  const paragraphs = []

  /** The paragraph currently being joined. */
  let current = ''
  for (const line of mapped) {
    if (line === '') {
      if (current) {
        paragraphs.push(current)
      }
      current = ''
      continue
    }
    if (line.startsWith('- ')) {
      if (current) {
        paragraphs.push(current)
      }
      current = ''
      paragraphs.push(line)
      continue
    }
    if (!current) {
      current = line
    } else if (/[.!?…:]$/.test(current)) {
      paragraphs.push(current)
      current = line
    } else {
      current = `${current} ${line}`
    }
  }
  if (current) {
    paragraphs.push(current)
  }

  return paragraphs.join('\n\n').trim()
}

/** The comment sitting directly above an export, blank lines ignored. */
function precedingDoc(lines, index) {
  /** Last non-blank line before the export. */
  let commentEnd = index - 1
  while (commentEnd >= 0 && lines[commentEnd].trim() === '') {
    commentEnd -= 1
  }
  if (commentEnd < 0) {
    return ''
  }

  /** One-line comments look like `/** sentence *\/` on a single line. */
  const single = lines[commentEnd].trim().match(/^\/\*\*(.*)\*\/$/)
  if (single) {
    return formatDoc(`/**${single[1]}*/`)
  }

  if (!lines[commentEnd].trim().endsWith('*/')) {
    return ''
  }

  /** Multi-line comment, walked back to the opening slash. */
  const chunk = []
  let cursor = commentEnd
  while (cursor >= 0 && !lines[cursor].includes('/**')) {
    chunk.unshift(lines[cursor])
    cursor -= 1
  }
  if (cursor >= 0) {
    chunk.unshift(lines[cursor])
  }

  return formatDoc(chunk.join('\n'))
}

/** Net `{` minus `}` on one line. */
function braceDelta(line) {
  /** Running difference for this line. */
  let delta = 0
  for (const character of line) {
    if (character === '{') {
      delta += 1
    } else if (character === '}') {
      delta -= 1
    }
  }

  return delta
}

/** True when a function signature has closed its parameter list and reached the body. */
function functionSignatureClosed(text) {
  /** Parenthesis depth across the lines gathered so far. */
  let depth = 0
  for (const character of text) {
    if (character === '(') {
      depth += 1
    } else if (character === ')') {
      depth -= 1
    }
  }

  return text.includes('(') && depth <= 0 && /\{\s*$/.test(text)
}

/** Signature or full type body, without the function implementation. */
function captureDeclaration(lines, index) {
  /** Opening line decides whether this is a function or a type. */
  const first = lines[index]
  const kind = first.match(/^export\s+(?:async\s+)?(function|const|let|type|interface|enum|class)\b/)

  if (!kind || kind[1] === 'function' || kind[1] === 'class') {
    /** Function lines through the opening brace of the body. */
    const parts = []
    for (let cursor = index; cursor < lines.length && cursor < index + 30; cursor += 1) {
      parts.push(lines[cursor])
      if (functionSignatureClosed(parts.join('\n'))) {
        parts[parts.length - 1] = parts[parts.length - 1].replace(/\{\s*$/, '').trimEnd()
        break
      }
    }

    return parts.join('\n').trim()
  }

  if (kind[1] === 'interface' || kind[1] === 'enum' || /=\s*\{/.test(first) || first.trimEnd().endsWith('{')) {
    /** Brace-balanced body, so interfaces and limit maps keep their fields. */
    const parts = [first]
    let depth = braceDelta(first)
    let cursor = index + 1
    while (cursor < lines.length && depth > 0 && cursor < index + 80) {
      parts.push(lines[cursor])
      depth += braceDelta(lines[cursor])
      cursor += 1
    }

    return parts.join('\n').trim()
  }

  if (kind[1] === 'type' && !first.includes('=')) {
    /** A union that continues on the next indented lines. */
    const parts = [first]
    let cursor = index + 1
    while (cursor < lines.length && cursor < index + 20 && /^\s*[|=]/.test(lines[cursor])) {
      parts.push(lines[cursor])
      cursor += 1
    }

    return parts.join('\n').trim()
  }

  return first.trim()
}

/** Identifier used as the heading, without the long first line. */
function exportName(signature) {
  /** `export function name` / `export type name` / `export const name`. */
  const match = signature.match(/^export\s+(?:async\s+)?(?:const|let|var|function|class|type|interface|enum)\s+([A-Za-z0-9_]+)/)

  return match ? match[1] : signature.split('\n')[0]
}

/** Pull the comment directly above each export. */
function extractExports(source) {
  /** Finished entries. */
  const items = []

  /** Source split so we can look backward from each export. */
  const lines = source.split('\n')

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].startsWith('export ')) {
      continue
    }

    /** Declaration readers can scan without the function body. */
    const signature = captureDeclaration(lines, index)

    /** Comment text, or a clear gap when the export has none. */
    const doc = precedingDoc(lines, index) || 'No description was written above this export.'

    items.push({
      name: exportName(signature),
      signature,
      doc
    })
  }

  return items
}

/** Every TypeScript file directly inside a folder. */
function typescriptFiles(directory) {
  return readdirSync(directory)
    .filter(name => name.endsWith('.ts'))
    .sort()
    .map(name => join(directory, name))
}

/** Markdown section for one source file and its exports. */
function referenceSection(filePath) {
  /** Path shown to the reader, relative to the repo root. */
  const label = relative(root, filePath)

  /** Exports found under that file. */
  const items = extractExports(readFileSync(filePath, 'utf8'))

  /** One heading per export. */
  const blocks = items.map((item) => {
    return [
      `### \`${item.name}\``,
      '',
      item.doc,
      '',
      '```ts',
      item.signature,
      '```',
      ''
    ].join('\n')
  })

  return `## \`${label}\`

${blocks.join('\n')}
`
}

/** Landing page. The four features are the sidebar categories. */
function landing() {
  return `---
layout: home
title: Thread Weaver
titleTemplate: Split a long post

hero:
  name: Thread Weaver
  text: Split a long post into posts that fit the platform.
  tagline: The work happens in the browser. The page does not store the text and it does not post for you.
  image:
    src: /logo.svg
    alt: Thread Weaver
  actions:
    - theme: brand
      text: Introduction
      link: /getting-started/introduction
    - theme: alt
      text: Installation
      link: /getting-started/installation

features:
  - title: Getting started
    details: What the tool is for, and how to run it locally.
    link: /getting-started/introduction
  - title: Using the tool
    details: Platforms, markers, bridges, text tools, and shipping.
    link: /using-the-tool/workbench
  - title: Architecture
    details: Where the split rules live, and where the browser calls live.
    link: /architecture/overview
  - title: Reference
    details: Every public function, taken from the comments in the source.
    link: /reference/types-and-limits
---

# Thread Weaver

Thread Weaver is a one-page editor. You paste a long post. The page cuts it into shorter posts that stay on word boundaries and fit the platform you picked.

The work happens in the browser. The page does not store the text and it does not post for you.

| | |
| --- | --- |
| [Platforms](/using-the-tool/platforms) | X at 280, Bluesky at 300, Threads at 500, and Mastodon at 500. |
| [Markers and bridges](/using-the-tool/markers-and-bridges) | Number each post, and insert your own bridge as you type. |
| [Shipping](/using-the-tool/shipping) | Copy, download Markdown, open a compose tab, listen, or show a QR code. |

## Start here

- [Introduction](/getting-started/introduction) explains what the tool is for.
- [Installation](/getting-started/installation) shows how to run it locally.
- [Architecture](/architecture/overview) is the map of the code.
- [Reference](/reference/types-and-limits) lists every public function.
`
}

/** Getting started pages. */
function gettingStarted() {
  writePage('getting-started/introduction.md', `---
title: Introduction
description: What Thread Weaver does, and what it deliberately does not do.
---

# Introduction

A long post is hard to read on a timeline. Thread Weaver splits that post into a sequence of shorter posts before you publish it.

## Who it is for

Use it when you already have the words and you need them to fit a character limit. The tool is a workbench, not a social network. It does not sign you in, and it does not keep a history of what you wrote.

## What stays on your machine

Splitting, markers, totals, and the download file are computed in the page. Copy uses the browser clipboard. Listen uses a voice already installed on the machine, and it follows the language written on the card: English, German, or Thai. Send opens the platform's compose page in a new tab and leaves the actual post to you.

The only remote call is the QR image. Send to Phone asks \`api.qrserver.com\` for a picture of the current post. Everything else stays local.

## Languages

The buttons are English at \`/\`, German at \`/de\`, and Thai at \`/th\`. The address picks that language. The browser language does not redirect. Listen still follows the card, so a German post on the English page is read in German.

## Version

The project is version **1.0.0**. That is the production release. Leave \`package.json\` on that number unless the maintainer asks for a bump.
`)

  writePage('getting-started/installation.md', `---
title: Installation
description: Run Thread Weaver locally with Bun.
---

# Installation

You need [Bun](https://bun.sh). The repository is [github.com/thaikolja/thread-weaver](https://github.com/thaikolja/thread-weaver).

## Install and start

\`\`\`bash
bun install
bun run dev
\`\`\`

Open the URL Bun prints. The home page is the editor.

## Check the project

| Command | Purpose |
| --- | --- |
| \`bun test\` | Run the splitter tests in \`tests/thread.test.ts\` |
| \`bun run typecheck\` | Check TypeScript |
| \`bun run lint\` | Run ESLint |
| \`bun run docs:dev\` | Preview this documentation |
| \`bun run docs:build\` | Regenerate the markdown and build the VitePress site |

## Documentation site

The guides are a [VitePress](https://vitepress.dev) site in \`/docs\`. \`scripts/generate-docs.mjs\` writes the categories and the pages. A GitHub Action rebuilds the site on every push to \`main\`.
`)
}

/** How to use the product. */
function usingTheTool() {
  writePage('using-the-tool/workbench.md', `---
title: The workbench
description: The parts of the page and what each one is for.
---

# The workbench

The page is one screen. The sections share a single editor through \`provideWeaver()\` and \`useWeaver()\`. The page file itself does not hold a long list of state.

## Sections

| Section | Component | What you do there |
| --- | --- | --- |
| Masthead | \`WeaverHeader\` | Read the name. The mark is the site logo. |
| Platform and source | \`WeaverWorkbench\` | Pick a platform, paste text, set the marker and the bridge. |
| Text tools | \`DraftTools\` | Capitalize posts, finish sentences, or keep line breaks. |
| Cards | \`PostList\` and \`PostCard\` | Read each post, reorder it, copy it, or drop it. |
| Ship station | \`ShipStation\` | See the totals, copy the sequence, or download Markdown. |
| QR | \`QrModal\` | Scan one post onto a phone. |
| Footer | \`WeaverFooter\` | The offline note. |

## A normal pass

1. Leave the sample sentence or replace it.
2. Pick the platform. The character ring uses that platform's limit.
3. Set the marker and, if you want one, the bridge.
4. Turn on a text tool only when you want that change.
5. Copy a card, copy the whole sequence, or download the Markdown file.

Clear empties the box. The page then shows one empty card so the marker still has a place to sit.
`)

  writePage('using-the-tool/platforms.md', `---
title: Platforms
description: The four character limits and what changes when you switch.
---

# Platforms

Each platform is a character budget. Switching platform packs the source again and drops any order you arranged by hand.

| Platform | Id | Limit |
| --- | --- | --- |
| X | \`x\` | 280 |
| Bluesky | \`bsky\` | 300 |
| Threads | \`threads\` | 500 |
| Mastodon | \`masto\` | 500 |

The default is X.

## What the limit means

The packer does not fill the whole limit with your words. It keeps 16 characters for a counter such as \`(999/999)\`, plus the length of the custom bridge. A single word that is still longer than that budget is left whole. The ring then turns red, \`hsl(0, 90%, 45%)\`, because the published post can exceed the limit.

Send opens one of these addresses, with the current post encoded on the end:

- \`https://x.com/intent/tweet?text=\`
- \`https://bsky.app/intent/compose?text=\`
- \`https://www.threads.net/intent/post?text=\`
- \`https://mastodon.social/share?text=\`
`)

  writePage('using-the-tool/markers-and-bridges.md', `---
title: Markers and bridges
description: How counters and the custom bridge are written into each post.
---

# Markers and bridges

A marker is the small counter on a post. A bridge is the text you type between the post and that counter.

## Markers

| Style | Example |
| --- | --- |
| Parentheses | \`(1/3)\` |
| Brackets | \`[1/3]\` |
| Raw fraction | \`1/3\` |
| Number tag | \`#1\` |
| None | The post text only |

The default is parentheses. Changing the marker does not pack the text again, so an order you arranged by hand stays put. \`none\` does not insert a bridge, because there is no counter to attach it to.

## Placement

| Placement | Result |
| --- | --- |
| New line (bottom) | The marker sits under the text. A bridge gets its own paragraph. |
| Header (top) | The marker sits above the text. A bridge gets its own paragraph. |
| Inline after | The marker follows the text on the same line. |
| Inline before | The marker leads the text on the same line. |

An empty bridge is a blank line, or a single space when the marker is inline. A bridge you type shows up immediately. You do not have to edit the source or change the placement first.

Inline posts join the bridge as a space, the bridge, and a space: \` \${bridge} \`.
`)

  writePage('using-the-tool/text-tools.md', `---
title: Text tools
description: Capitalize posts, finish sentences, and keep line breaks.
---

# Text tools

Three switches sit under the marker fields. Each one has an icon. They replace the old "Flatten blank lines" control, which did not change the packed posts: a blank line was already treated as a space.

## Capitalize posts

The first visible letter of each post becomes uppercase. The chunks are not packed again, so the order stays. \`alpha beta\` is published as \`Alpha beta\`.

## Finish sentences

If a post does not already end with \`.\`, \`!\`, \`?\`, \`…\`, or \`...\`, the page adds \`…\`. \`Hello.\` is left alone. \`Hello\` becomes \`Hello…\`. The extra character is part of the published length, so the ring can move.

## Keep line breaks

Off, which is the default, a line break is just another space. \`hello\` and \`world\` on two lines become \`hello world\`.

On, a line break stays in the post, and a blank line stays a blank line. Turning this on packs the source again and drops a hand-made order, because the shape of the chunks can change.
`)

  writePage('using-the-tool/shipping.md', `---
title: Shipping a thread
description: Copy, download, listen, and send.
---

# Shipping a thread

The ship station is the summary under the cards.

## Totals

- **Total length** is the sum of the published posts, markers and bridges included.
- **Total words** counts words in the source box, not in the counters.
- **Read time** is at least one minute, otherwise \`round(words / 200)\`.
- **Format target** is the platform name, such as X or Bluesky.

## Copy

Copy on a card writes that post. Copy Entire Sequence joins every post with a blank line, \`---\`, and another blank line. The sequence button says it copied, then clears that label after 2.5 seconds.

Editing the draft clears those checkmarks. Segment ids are reused after a fresh pack, and a checkmark must not stick to a different sentence.

## Download

Download .md saves \`thread-<platform>-<timestamp>.md\`. Each post is a \`### Post N\` section, joined the same way as copy-all.

## Listen and QR

Listen reads the card without the chunk counter the page attached, such as \`(1/3)\` or \`[1/3]\`. A bridge you typed is still read. A counter you wrote inside the post, such as "see [1/2] in the notes", is still read. Copy, download, and send keep the counter.

The voice is one already installed. English text uses a clear English voice, German text a German voice, and Thai text a Thai voice. Joke voices and compact voices are skipped. Nothing is downloaded. The rate is 1.05. Clicking the same card again stops it.

Send to Phone opens a QR for that post. The picture comes from \`api.qrserver.com\`. Closing the draft, or editing it, closes the QR as well.
`)
}

/** How the code is put together. */
function architecture() {
  writePage('architecture/overview.md', `---
title: Overview
description: Where the rules live, and where the browser calls live.
---

# Overview

The rules that decide the posts are pure TypeScript. They do not import Vue, and they do not touch \`window\`. The Vue layer only holds state and calls the browser.

\`\`\`text
app/pages/index.vue
  provideWeaver()
    useThreadWeaver()
      useWeaverDraft()      -> app/utils/weaver
      useWeaverClipboard()
      useWeaverSpeech()
      useWeaverPublish()
  sections call useWeaver()
\`\`\`

## Folders

| Path | Role |
| --- | --- |
| \`app/utils/weaver/\` | Split, compile, totals, links, speech decision |
| \`app/composables/\` | The editor the page shares |
| \`app/components/\` | The screen, one piece per file |
| \`app/pages/index.vue\` | Layout only |
| \`tests/thread.test.ts\` | The rules, imported from the real modules |
| \`docs/\` | These VitePress guides. GitHub Actions rebuilds the site on every push. |

\`template.html\` at the repository root is the original page. The Nuxt app is the product. Do not load Vue or Tailwind from a CDN.
`)

  writePage('architecture/page-and-state.md', `---
title: Page and state
description: How one editor is shared, and which edits pack the text again.
---

# Page and state

\`index.vue\` calls \`provideWeaver()\` once. Every section calls \`useWeaver()\` and reads the fields it needs. That is why the page file is not a long list of constants.

\`useThreadWeaver()\` returns one reactive object. Templates can use \`weaver.source\` without \`.value\`.

## What packs again

| Edit | Packs again | Drops hand-made order |
| --- | --- | --- |
| Source | Yes | Yes |
| Platform | Yes | Yes |
| Bridge length | Yes | Yes |
| Keep line breaks | Yes | Yes |
| Marker | No | No |
| Placement | No | No |
| Capitalize posts | No | No |
| Finish sentences | No | No |
| Move or drop | No | No |

A move that would pass either end returns the same state object. Copy checkmarks, speech, and an open QR are left alone in that case. Any real edit clears them.

## Components

The workbench is \`PlatformPicker\`, \`SourceField\`, \`MarkerFields\`, and \`DraftTools\`. A card is \`PostMoveButtons\`, \`PostLengthRing\`, and \`PostActions\`. Names are more than one word because the lint rule requires it.
`)

  writePage('architecture/splitting.md', `---
title: Splitting
description: How a source string becomes posts that fit a limit.
---

# Splitting

\`splitSource\` trims the source. An empty box becomes one chunk, \`b-0\`, with empty text.

Otherwise the text is words. The budget is \`limit - (16 + bridge.length)\`. The 16 characters are room for a long counter. Words are added until the next word would pass the budget. A word that is already too long stays whole, even if the ring will turn red.

With **Keep line breaks** off, every line break is whitespace, so the words are joined with single spaces. With it on, the gap between lines is a newline, and a blank line stays blank. The newline counts toward the budget.

\`compileThread\` then polishes each chunk and attaches the marker. Polish can capitalize the first letter and append \`…\`. The \`raw\` field on a post is that polished text. \`compiled\` is the text plus the marker and the bridge. \`spoken\` is that same card with the counter left off. Listen reads \`spoken\`. Copy, download, and send use \`compiled\`.

The tests in \`tests/thread.test.ts\` import these functions directly. They do not reimplement the packer.
`)
}

/** Reference pages built from the comments above each export. */
function reference() {
  /** Groups of source files. */
  const groups = [
    {
      file: 'reference/types-and-limits.md',
      title: 'Types and limits',
      description: 'Platform caps, shared types, and the constants the editor starts from.',
      paths: [
        join(root, 'app/utils/weaver/types.ts'),
        join(root, 'app/utils/weaver/limits.ts'),
        join(root, 'app/utils/weaver/platformClass.ts')
      ]
    },
    {
      file: 'reference/splitting-and-compile.md',
      title: 'Splitting and compile',
      description: 'Packing, markers, bridges, and the text tools.',
      paths: [
        join(root, 'app/utils/weaver/split.ts'),
        join(root, 'app/utils/weaver/compile.ts')
      ]
    },
    {
      file: 'reference/state-and-metrics.md',
      title: 'State and metrics',
      description: 'Edits, totals, the ring, and the files you copy or send.',
      paths: [
        join(root, 'app/utils/weaver/state.ts'),
        join(root, 'app/utils/weaver/metrics.ts'),
        join(root, 'app/utils/weaver/publish.ts'),
        join(root, 'app/utils/weaver/speech.ts')
      ]
    },
    {
      file: 'reference/composables.md',
      title: 'Composables',
      description: 'The Vue layer that holds the editor and talks to the browser.',
      paths: typescriptFiles(join(root, 'app/composables'))
    }
  ]

  for (const group of groups) {
    /** Reference body for this group. */
    const sections = group.paths.map(referenceSection).join('\n')

    writePage(group.file, `---
title: ${group.title}
description: ${group.description}
---

# ${group.title}

${group.description} The notes below are the comments on the exports, so this page follows the code.

${sections}
`)
  }

  /** Vue components, listed with the comment at the top of each script. */
  const componentDir = join(root, 'app/components')
  const componentNotes = readdirSync(componentDir)
    .filter(name => name.endsWith('.vue'))
    .sort()
    .map((name) => {
      const source = readFileSync(join(componentDir, name), 'utf8')
      const script = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)
      const body = script ? script[1] : ''
      const notes = []
      const pattern = /\/\*\*([\s\S]*?)\*\//g
      let match = pattern.exec(body)
      while (match) {
        const text = formatDoc(`/**${match[1]}*/`)
        if (text) {
          notes.push(text)
        }
        match = pattern.exec(body)
      }
      const doc = notes.length > 0 ? notes.join('\n\n') : 'Presentational section of the workbench.'
      return `## \`${name}\`

${doc}
`
    })
    .join('\n')

  writePage('reference/components.md', `---
title: Components
description: The Vue files that draw the workbench.
---

# Components

Each file is one part of the screen. Interactive parts call \`useWeaver()\`. A card receives only the post and its index.

${componentNotes}
`)
}

/** Sidebar and nav. The same four categories as the home page. */
function writeConfig() {
  /** VitePress config next to the markdown. */
  const configPath = join(contentDir, '.vitepress/config.ts')

  mkdirSync(dirname(configPath), { recursive: true })

  writeFileSync(configPath, `import { defineConfig } from 'vitepress'

/** Project Pages site: https://thaikolja.github.io/thread-weaver/ */
const base = '/thread-weaver/'

export default defineConfig({
  title: 'Thread Weaver',
  description: 'Split a long post into posts that fit X, Bluesky, Threads, and Mastodon.',
  base,
  lang: 'en-US',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: \`\${base}logo.svg\` }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Thread Weaver',
    nav: [
      { text: 'Getting started', link: '/getting-started/introduction' },
      { text: 'Using the tool', link: '/using-the-tool/workbench' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'Reference', link: '/reference/types-and-limits' }
    ],
    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Introduction', link: '/getting-started/introduction' },
          { text: 'Installation', link: '/getting-started/installation' }
        ]
      },
      {
        text: 'Using the tool',
        items: [
          { text: 'The workbench', link: '/using-the-tool/workbench' },
          { text: 'Platforms', link: '/using-the-tool/platforms' },
          { text: 'Markers and bridges', link: '/using-the-tool/markers-and-bridges' },
          { text: 'Text tools', link: '/using-the-tool/text-tools' },
          { text: 'Shipping', link: '/using-the-tool/shipping' }
        ]
      },
      {
        text: 'Architecture',
        items: [
          { text: 'Overview', link: '/architecture/overview' },
          { text: 'Page and state', link: '/architecture/page-and-state' },
          { text: 'Splitting', link: '/architecture/splitting' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Types and limits', link: '/reference/types-and-limits' },
          { text: 'Splitting and compile', link: '/reference/splitting-and-compile' },
          { text: 'State and metrics', link: '/reference/state-and-metrics' },
          { text: 'Composables', link: '/reference/composables' },
          { text: 'Components', link: '/reference/components' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/thaikolja/thread-weaver' }
    ],
    search: {
      provider: 'local'
    },
    outline: [2, 3],
    footer: {
      message: 'MIT License'
    }
  }
})
`)
}

/** Remove the previous site, then write the current pages and sidebar. */
function main() {
  rmSync(contentDir, { recursive: true, force: true })
  mkdirSync(docsPublic, { recursive: true })
  copyFileSync(join(root, 'public/logo.svg'), join(docsPublic, 'logo.svg'))
  writeConfig()
  writePage('index.md', landing())
  gettingStarted()
  usingTheTool()
  architecture()
  reference()
}

main()
