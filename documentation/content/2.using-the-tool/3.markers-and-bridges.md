---
title: Markers and bridges
description: How counters and the custom bridge are written into each post.
---

# Markers and bridges

A marker is the small counter on a post. A bridge is the text you type between the post and that counter.

## Markers

| Style | Example |
| --- | --- |
| Parentheses | `(1/3)` |
| Brackets | `[1/3]` |
| Raw fraction | `1/3` |
| Number tag | `#1` |
| None | The post text only |

The default is parentheses. Changing the marker does not pack the text again, so an order you arranged by hand stays put. `none` does not insert a bridge, because there is no counter to attach it to.

## Placement

| Placement | Result |
| --- | --- |
| New line (bottom) | The marker sits under the text. A bridge gets its own paragraph. |
| Header (top) | The marker sits above the text. A bridge gets its own paragraph. |
| Inline after | The marker follows the text on the same line. |
| Inline before | The marker leads the text on the same line. |

An empty bridge is a blank line, or a single space when the marker is inline. A bridge you type shows up immediately. You do not have to edit the source or change the placement first.

Inline posts join the bridge as a space, the bridge, and a space: ` ${bridge} `.
