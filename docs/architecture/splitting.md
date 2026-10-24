---
title: Splitting
description: How a source string becomes posts that fit a limit.
---

# Splitting

`splitSource` trims the source. An empty box becomes one chunk, `b-0`, with empty text.

Otherwise the text is words. The budget is `limit - (16 + bridge.length)`. The 16 characters are room for a long counter. Words are added until the next word would pass the budget. A word that is already too long stays whole, even if the ring will turn red.

With **Keep line breaks** off, every line break is whitespace, so the words are joined with single spaces. With it on, the gap between lines is a newline, and a blank line stays blank. The newline counts toward the budget.

`compileThread` then polishes each chunk and attaches the marker. Polish can capitalize the first letter and append `…`. The `raw` field on a post is that polished text. `compiled` is the text plus the marker and the bridge. `spoken` is that same card with the counter left off. Listen reads `spoken`. Copy, download, and send use `compiled`.

The tests in `tests/thread.test.ts` import these functions directly. They do not reimplement the packer.
