---
title: "Shipping a thread"
description: "Copy, download, listen, and send."
canonical_url: "https://weaver.yanawa.io/using-the-tool/shipping"
---
# Shipping a thread

The ship station is the summary under the cards.

## Totals

- **Total length** is the sum of the published posts, markers and bridges included.
- **Total words** counts words in the source box, not in the counters.
- **Read time** is at least one minute, otherwise `round(words / 200)`.
- **Format target** is the platform name, such as X or Bluesky.

## Copy

Copy on a card writes that post. Copy Entire Sequence joins every post with a blank line, `---`, and another blank line. The sequence button says it copied, then clears that label after 2.5 seconds.

Editing the draft clears those checkmarks. Segment ids are reused after a fresh pack, and a checkmark must not stick to a different sentence.

## Download

Download .md saves `thread-<platform>-<timestamp>.md`. Each post is a `### Post N` section, joined the same way as copy-all.

## Listen and QR

Listen speaks the published post at rate 1.05. Clicking the same card again stops it. Send to Phone opens a QR for that post. Closing the draft, or editing it, closes the QR as well.


## Sitemap

See the full [sitemap](https://weaver.yanawa.io/sitemap.md) for all pages.
