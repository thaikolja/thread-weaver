---
title: Platforms
description: The four character limits and what changes when you switch.
---

# Platforms

Each platform is a character budget. Switching platform packs the source again and drops any order you arranged by hand.

| Platform | Id | Limit |
| --- | --- | --- |
| X | `x` | 280 |
| Bluesky | `bsky` | 300 |
| Threads | `threads` | 500 |
| Mastodon | `masto` | 500 |

The default is X.

## What the limit means

The packer does not fill the whole limit with your words. It keeps 16 characters for a counter such as `(999/999)`, plus the length of the custom bridge. A single word that is still longer than that budget is left whole. The ring then turns red, `hsl(0, 90%, 45%)`, because the published post can exceed the limit.

Send opens one of these addresses, with the current post encoded on the end:

- `https://x.com/intent/tweet?text=`
- `https://bsky.app/intent/compose?text=`
- `https://www.threads.net/intent/post?text=`
- `https://mastodon.social/share?text=`
