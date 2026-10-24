---
title: "State and metrics"
description: "Edits, totals, the ring, and the files you copy or send."
canonical_url: "https://weaver.yanawa.io/reference/state-and-metrics"
---
# State and metrics

Edits, totals, the ring, and the files you copy or send. The notes below are the comments on the exports, so this page follows the code.

## `app/utils/weaver/state.ts`

### `createWeaverState`

A fresh editor: X, parentheses, marker on its own line, no bridge.

```ts
export function createWeaverState(source: string = SAMPLE_SOURCE): WeaverState
```

### `setSource`

New source text. Manual order is dropped because we pack from scratch.

```ts
export function setSource(state: WeaverState, source: string): WeaverState
```

### `setCapitalize`

Capitalize the first letter of each post. The chunks stay where they are.

```ts
export function setCapitalize(state: WeaverState, capitalize: boolean): WeaverState
```

### `setFinishSentences`

Add … to a post that does not already end a sentence. Does not repack.

```ts
export function setFinishSentences(state: WeaverState, finishSentences: boolean): WeaverState
```

### `setKeepBreaks`

Keep line breaks in the posts and pack again. Manual order is dropped.

```ts
export function setKeepBreaks(state: WeaverState, keepBreaks: boolean): WeaverState
```

### `setPlatform`

Switch platform and use that platform's limit. The bridge stays.

```ts
export function setPlatform(state: WeaverState, platform: PlatformId): WeaverState
```

### `setBridge`

Change the bridge.

A longer or shorter bridge changes the budget, so we pack again.

The same length keeps the current order and still shows the new characters.

```ts
export function setBridge(state: WeaverState, bridge: string): WeaverState
```

### `setMarker`

Swap the counter style. The chunks stay where they are.

```ts
export function setMarker(state: WeaverState, marker: MarkerFormat): WeaverState
```

### `setPlacement`

Move the counter. Still no repack.

```ts
export function setPlacement(state: WeaverState, placement: MarkerPlacement): WeaverState
```

### `moveSegment`

Slide one chunk up or down.

Going past either end returns the same state, so nothing else resets.

```ts
export function moveSegment(state: WeaverState, index: number, delta: number): WeaverState
```

### `dropSegment`

Delete one chunk. The others keep their text. They are not glued back together.

```ts
export function dropSegment(state: WeaverState, index: number): WeaverState
```

## `app/utils/weaver/metrics.ts`

### `totalChars`

Add up the published length, markers and bridges included.

```ts
export function totalChars(posts: readonly CompiledPost[]): number
```

### `totalWords`

Count words in the source box. Markers and bridges are not words.

```ts
export function totalWords(source: string): number
```

### `readTimeMinutes`

Rough read time. At least a minute, otherwise about 200 words a minute.

```ts
export function readTimeMinutes(words: number): number
```

### `ringColor`

Color for the little ring.

Over the limit is a hard red. Under it, the hue slides from green toward red.

```ts
export function ringColor(currentLen: number, maxLimit: number): string
```

### `ringDashOffset`

How far around the ring the stroke should stop. 0 is a full circle.

```ts
export function ringDashOffset(length: number, limit: number): number
```

## `app/utils/weaver/publish.ts`

### `copyAllBody`

All posts, separated the way "Copy Entire Sequence" pastes them.

```ts
export function copyAllBody(posts: readonly CompiledPost[]): string
```

### `markdownBody`

A markdown file: a heading per post, same separators as copy-all.

```ts
export function markdownBody(posts: readonly CompiledPost[]): string
```

### `markdownFilename`

File name like `thread-x-1710000000000.md`.

```ts
export function markdownFilename(platform: PlatformId, timestamp: number): string
```

### `intentUrl`

Compose link with the post already encoded.

```ts
export function intentUrl(platform: PlatformId, compiled: string): string
```

### `qrImageUrl`

Image address for the phone QR. The image itself is still remote.

```ts
export function qrImageUrl(compiled: string): string
```

## `app/utils/weaver/speech.ts`

### `speechCommand`

Decide the next Listen click.

No speech API means do nothing. The same post already talking means stop.

Anything else means start that post at the usual rate.

```ts
export function speechCommand(
  apiAvailable: boolean,
  currentId: string | null,
  postId: string,
  text: string,
  isSpeaking: boolean
): SpeechCommand
```

### `armCopyAllReset`

Turn the "copied everything" flag on, then schedule it to turn off.

Tests pass their own timer so they don't have to wait 2.5 seconds.

```ts
export function armCopyAllReset(
  mark: (copied: boolean) => void,
  schedule: (fn: () => void, ms: number) => void
): void
```


## Sitemap

See the full [sitemap](https://weaver.yanawa.io/sitemap.md) for all pages.
