# Changelog

New lines follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). The subject is `type(scope): imperative description`.

## Unreleased

- feat(ui): fade the posts when a control changes what they show
- feat(i18n): show ไทย on the Thai language link
- fix(ui): inset the select carets and keep the tool checks bright
- feat(ui): use Phosphor icons
- feat(i18n): add EN, DE, and TH links at the top right of the page
- build(preview): upload the static app to Cloudflare Workers with Wrangler

## 1.0.0 — 2026-10-25

First production release of Thread Weaver.

### Splitting

- Cuts a long post on word boundaries for X (280), Bluesky (300), Threads (500), and Mastodon (500).
- A single word longer than the budget stays whole.
- Markers are `(i/n)`, `[i/n]`, `i/n`, `#i`, or none.
- Placements are a new line under the text, a header above it, inline after, and inline before.
- A custom bridge appears as you type.
- Text tools capitalize each post, finish an open sentence with `…`, and keep line breaks.
- Reorder or drop a segment without packing again. Changing the source, the platform, line breaks, or the bridge length packs again from the source.

### Shipping

- Copy one post, or the whole sequence joined by a blank line, `---`, and another blank line.
- Download `thread-<platform>-<timestamp>.md`.
- Send opens the platform compose page. The tool does not post for you.
- The phone QR is an image from `api.qrserver.com`.

### Listen

- Reads the card without the chunk counter the page attached.
- Keeps a bridge you typed, and keeps a counter you wrote inside the post.
- Uses a clear voice already installed for English, German, or Thai.
- Skips joke voices and compact voices. Nothing is downloaded.
- Speaks at rate 1.05. Clicking the same card again stops it.

### Documentation

- The guides are a VitePress site in `/docs`, with Getting started, Using the tool, Architecture, and Reference.
- GitHub Actions rebuilds that site on every push to `main`.

### Page

- English at `/`, German at `/de`, and Thai at `/th`.
- Splitting, markers, copy text, and the download run in the browser.
- No accounts, history, or server storage.
