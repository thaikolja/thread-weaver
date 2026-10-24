---
title: Page and state
description: How one editor is shared, and which edits pack the text again.
---

# Page and state

`index.vue` calls `provideWeaver()` once. Every section calls `useWeaver()` and reads the fields it needs. That is why the page file is not a long list of constants.

`useThreadWeaver()` returns one reactive object. Templates can use `weaver.source` without `.value`.

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

The workbench is `PlatformPicker`, `SourceField`, `MarkerFields`, and `DraftTools`. A card is `PostMoveButtons`, `PostLengthRing`, and `PostActions`. Names are more than one word because the lint rule requires it.
