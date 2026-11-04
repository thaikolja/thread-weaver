# Changelog

New lines follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). The subject is
`type(scope): imperative description`.

## Unreleased

- fix(ci): polyfill findPackageJSON so bun can load the seo modules
- ci: drop the github actions workflows from the gitlab mirror
- fix(dev): quiet the dev server seo warnings and failed first load
- build(deps): drop unused install weight and test in ci
- fix(qr): draw the phone code in the browser
- fix(ui): close the qr layer from the keyboard
- fix(ui): name the draft character count
- build(preview): serve the worker at thread-weaver.kolja.codes

## v1.0.0 — 2026-11-03

This is the initial release of the app – the tedious tested and polished version of the prototype. It is a 
single-page app that runs in the browser, with no server-side code. It can be deployed to any static hosting service, such as GitHub
Pages or Cloudflare Workers.

- fix (docs): serve the static guides at /docs on the editor site
- fix (ui): show the phone qr for the current post
- fix (build): match the fonts override to its direct range
- fix (build): match the typescript override to its direct range so `npx` can start
- fix (dev): pin the dev server host so `nuxt dev` can start
- ci (docs): build the Docus site on main and serve it at /docs
- feat (ui): slide a chunk when it moves up or down
- fix (ui): keep the page above the editor from fading
- feat (ui): fade the posts when a control changes what they show
- feat (i18n): show ไทย on the Thai language link
- fix (ui): inset the select carets and keep the tool checks bright
- feat (ui): use Phosphor icons
- feat (i18n): add EN, DE, and TH links at the top right of the page
- build (preview): upload the static app to Cloudflare Workers with Wrangler
- feat (split): cut a long post on word boundaries for x, bluesky, threads, and mastodon
- feat (split): keep a single word longer than the budget whole
- feat (markers): offer (i/n), [i/n], i/n, #i, and none
- feat (markers): place the marker on a new line, as a header, or inline
- feat (bridge): show a custom bridge as you type
- feat (tools): capitalize each post, finish an open sentence, and keep line breaks
- feat (editor): reorder or drop a segment without packing again
- feat (copy): copy one post or the whole sequence joined by a rule
- feat (download): save the thread as markdown
- feat (publish): open the platform compose page without posting
- feat (qr): show a phone qr from the compose link
- feat (speech): read the card without the attached chunk counter
- feat (speech): keep a typed bridge and a counter written in the post
- feat (speech): use an installed voice for english, german, or thai
- feat (speech): skip joke voices and compact voices
- feat (speech): speak at rate 1.05 and stop on a second click
- docs: add guides for getting started, using the tool, architecture, and reference
- ci (docs): rebuild the guides on every push to main
- feat (i18n): serve english at /, german at /de, and thai at /th
- feat: run splitting, markers, copy text, and download in the browser
- feat: keep accounts, history, and server storage out of the app
