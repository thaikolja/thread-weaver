---
title: The workbench
description: The parts of the page and what each one is for.
---

# The workbench

The page is one screen. The sections share a single editor through `provideWeaver()` and `useWeaver()`. The page file itself does not hold a long list of state.

## Sections

| Section | Component | What you do there |
| --- | --- | --- |
| Masthead | `WeaverHeader` | Read the name. The mark is the site logo. |
| Platform and source | `WeaverWorkbench` | Pick a platform, paste text, set the marker and the bridge. |
| Text tools | `DraftTools` | Capitalize posts, finish sentences, or keep line breaks. |
| Cards | `PostList` and `PostCard` | Read each post, reorder it, copy it, or drop it. |
| Ship station | `ShipStation` | See the totals, copy the sequence, or download Markdown. |
| QR | `QrModal` | Scan one post onto a phone. |
| Footer | `WeaverFooter` | The offline note. |

## A normal pass

1. Leave the sample sentence or replace it.
2. Pick the platform. The character ring uses that platform's limit.
3. Set the marker and, if you want one, the bridge.
4. Turn on a text tool only when you want that change.
5. Copy a card, copy the whole sequence, or download the Markdown file.

Clear empties the box. The page then shows one empty card so the marker still has a place to sit.
