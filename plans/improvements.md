# Thread Weaver improvements

Survey of the editor at commit `4bdac7e` (2026-11-03). This file is the survey. Executable handoffs are `plans/001-trim-install.md`, `plans/002-local-qr.md`, `plans/003-qr-dialog.md`, and `plans/004-character-counts.md`, indexed in `plans/README.md`.

Application source was not changed. Suggestions for what to build next are under Direction, not in the defect list.

## Performance

### P3 — The home-page stylesheet is the whole Tailwind and Nuxt UI bundle

- **Evidence**: `app/assets/css/main.css:18` imports `@nuxt/ui` after Tailwind. A fetch of the deployed stylesheet `/_nuxt/entry.BJX3Dhon.css` on 2026-11-03 was 213,072 bytes and contained no `@font-face` rules. That measurement is recorded beside this survey.
- **Impact**: Every visit downloads about 213 KB of CSS before the editor can paint. Most of that file is the UI kit, not the page's own rules.
- **Change**: Keep the page styles in `app/assets/css/main.css`. Stop shipping unused Nuxt UI component CSS, or split the kit so the editor only loads the utilities it uses. Re-measure the entry stylesheet after a production generate.
- **Priority**: P3. The byte cost is real, and the fix can break every control. Do this after the smaller install cut in plan 001.
- **Effort**: L. **Risk**: HIGH. **Confidence**: HIGH for the size, MED for how much of the 213 KB is removable.
- **Inferred**: which rules inside that file are unused. The 213,072 byte figure is measured. No plan is written, because a safe cut was not obvious from the source.

### P4 — Buttons keep a compositor hint while they sit still

- **Evidence**: `app/assets/css/main.css:139` sets `will-change: transform` inside `@utility btn-tactile`, which starts at line 137. That class stays on controls that are always mounted, such as the copy button at `app/components/PostCard.vue:117`. The card move is not this. `app/components/PostList.vue:144` uses `TransitionGroup` with `name="thread-chain"`, so Vue adds `.thread-chain-move` only while a card moves. The `will-change` on that class at `app/assets/css/main.css:65`, and on `.thread-chain-enter-active` at line 117, already ends with the transition.
- **Impact**: Each tactile button can hold a layer for the whole visit, not only for the 0.15s hover. The page has a handful of those buttons, so the cost is small. Idle cards do not keep the move layer.
- **Change**: Remove `will-change` from `btn-tactile`. Leave the `.thread-chain-*` rules alone. Keep the reduced-motion block at `app/assets/css/main.css:104`.
- **Priority**: P4. Small. Not a handoff.
- **Effort**: S. **Risk**: LOW. **Confidence**: HIGH for where the property sits. Whether the browser keeps a layer is inferred from the source. No frame trace was taken.

Plus Jakarta Sans is listed at `nuxt.config.ts:136` with `global: true` and five weights, while `app/assets/css/main.css:21` and line 56 force the system UI font. The shipped entry CSS contained zero occurrences of "Plus Jakarta". `Agents.md` and `tests/thread.test.ts:573` require the family to stay in the Nuxt fonts list, so removing the name is not a defect. No download size is claimed.

## UI

### P2 — The phone QR is a click-catcher, not a dialog

- **Evidence**: `app/components/QrModal.vue:27` renders a `div` when `weaver.activeQrUrl` is set. The backdrop click at line 30 closes it. There is no `role="dialog"`, no `aria-modal`, no Escape handler, and no focus move. The close control is a plain button at line 50.
- **Impact**: Keyboard and screen-reader users get a layer that does not announce itself, does not trap focus, and does not close from Escape. A pointer user can dismiss it only by clicking the backdrop or Close.
- **Change**: Mark the panel as a dialog labelled by the existing title, move focus into it, restore focus on close, and close on Escape. Leave the image source alone. That source is plan 002.
- **Priority**: P2. Plan `plans/003-qr-dialog.md`.
- **Effort**: S. **Risk**: LOW. **Confidence**: HIGH.

Move buttons already expose `aria-label` at `app/components/PostMoveButtons.vue:35`. That pattern is the one the dialog should follow. No visual redesign.

## UX

### P2 — The draft count and the post ring count different strings with the same idea of "characters"

- **Evidence**: `app/components/DraftTools.vue:63` prints `tools.characters` with `weaver.source.length`. The English string is `{count} characters` in `i18n/locales/en-US.json:56`. `app/components/PostCard.vue:52` passes `post.compiled.length` to the ring. Compiled text includes the marker and the bridge (`app/utils/weaver/compile.ts` builds `compiled`). The ship block then sums those compiled lengths as "Total Length" (`i18n/locales/en-US.json:86`).
- **Impact**: A one-post sample shows one count under the tools and a larger count on the card. Both are honest, and neither label says so. People treat the ring as "over the limit" and the tool count as the same number.
- **Change**: Keep both numbers. Name the tool count as the draft, and keep the ring as the post that will be copied. Add the same keys in `i18n/locales/de-DE.json` and `i18n/locales/th-TH.json`. Do not change packing.
- **Priority**: P2. Plan `plans/004-character-counts.md`.
- **Effort**: S. **Risk**: LOW. **Confidence**: HIGH.

### P3 — The post body cannot be selected

- **Evidence**: `app/components/PostCard.vue:76` copies the whole card on click. Line 134 sets `select-none` on `.c-post-text`. The visible hint is `post.copyTitle`, "Click anywhere to copy this chunk" (`i18n/locales/en-US.json:69`).
- **Impact**: A person cannot highlight one sentence. The Copy button at line 55 already copies the post.
- **Change**: Allow selection in the post text. Keep the Copy button. If the body stays clickable, ignore clicks that start a selection.
- **Priority**: P3. Not a handoff. Easy to get wrong next to the copy-on-click behavior, and the Copy button already exists.
- **Effort**: S. **Risk**: MED. **Confidence**: HIGH.

## DX

### P1 — Install pulls Playwright, an unused icon set, and a package named `latest`

- **Evidence**: `package.json:38` depends on `playwright` `1.64.1`. `package.json:25` depends on `@iconify-json/simple-icons`. `package.json:49` depends on the npm package `latest` at `^0.2.0`. No file under `app/` or `tests/` imports `playwright`, `@iconify-json/simple-icons`, or the package `latest`. Those names are declared in `package.json` and repeated in `bun.lock` (`simple-icons` at line 9, `playwright` at line 22, `latest` at line 33). `docs/bun.lock:176` also lists `@iconify-json/simple-icons` because Docus depends on it. Icons in `app/components/` use `i-ph-*` only. `package.json:46` and line 42 set `eslint` and `@nuxt/eslint` to the tag `latest`. Installed copies on this machine were eslint 10.14.0 and `@nuxt/eslint` 1.17.0. Disk use of the unused trees: `playwright` 4.9M, `@iconify-json/simple-icons` 4.6M. The local Playwright browser cache was 572M. That cache figure is this machine, not a clean CI measurement.
- **Impact**: `bun install` in `.gitlab-ci.yml:21` and `.github/workflows/docs.yml:30` installs a browser driver the app never imports. `simple-icons` is another 4.6M the icon scan does not reference. The package named `latest` is an accident. Floating `latest` tags make the next install a different linter.
- **Change**: Remove `playwright`, `@iconify-json/simple-icons`, and `latest` from `package.json` and the lockfile. Pin `eslint` to `10.14.0` and `@nuxt/eslint` to `1.17.0`. Leave `@nuxt/image` in place: `nuxt.config.ts:195` sets `ogImage.zeroRuntime`, and this survey did not prove the image module is unused.
- **Priority**: P1. Plan `plans/001-trim-install.md`.
- **Effort**: S. **Risk**: LOW. **Confidence**: HIGH that nothing imports those three packages. MED that some future test wanted Playwright. No test file imports it today.

### P2 — CI builds the site and never runs the test suite

- **Evidence**: `.gitlab-ci.yml:15` job `build-site` runs `bun install` and `bun run build:site` only. `.github/workflows/docs.yml:35` does the same. `package.json:14` defines `bun test`, and `package.json:16` defines `bun run typecheck`. Neither workflow calls them.
- **Impact**: A push to `main` can publish a tree that fails the splitter tests. The suite is fast (it imports `app/utils/weaver/` directly) and is the check `Agents.md` requires before a behavior change.
- **Change**: Add a job that runs `bun test` and `bun run typecheck` before `build:site`. Do not make the Cloudflare deploy unconditional.
- **Priority**: P2. The CI step lives in `plans/001-trim-install.md` because those workflows are already edited there. The test job is its own step in that plan.
- **Effort**: S. **Risk**: LOW. **Confidence**: HIGH.

`@nuxt/scripts` (`nuxt.config.ts:36`, 6.9M on disk) and `@nuxt/hints` (`nuxt.config.ts:37`, 11M on disk) have no call sites under `app/`. Removing them is reasonable and is called out in plan 001 with a stop if `nuxt prepare` fails. Inferred: they add module setup cost. This survey did not trace their generated client bytes.

## General

### P1 — Show QR sends the post to api.qrserver.com

- **Evidence**: `app/utils/weaver/publish.ts:50` builds `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=` plus the encoded post. `app/composables/useWeaverPublish.ts:55` stores that URL, and `app/components/QrModal.vue:41` puts it on an `img`. `README.md:22` says the QR image is loaded from `api.qrserver.com` and that the rest of the tool does not call a backend. `tests/thread.test.ts:411` pins the remote URL. `nuxt-qrcode` is already a dependency (`package.json:37`) and a module (`nuxt.config.ts:41`), with options at `nuxt.config.ts:199`. The page never renders a `Qrcode` component. The test at `tests/thread.test.ts:571` forbids that tag. The module defaults paint yellow on blue.
- **Impact**: The README promises the tool does not take the user's text. The QR button sends the full compiled post to a third party and waits on that image. A long post also makes a very long image URL. The installed local renderer is unused, and its configured colors would be a poor code if turned on as they are.
- **Change**: Render the QR in the browser from the compiled post. Use the existing `Qrcode` component with black on white, including the module defaults. Stop requesting `api.qrserver.com`. Update the two tests and the README sentence. Do not change intent URLs or the packer.
- **Priority**: P1. Plan `plans/002-local-qr.md`.
- **Effort**: M. **Risk**: MED, because the remote image is what the tests lock. **Confidence**: HIGH.

### Needs maintainer approval — Canonical and share URLs still name weaver.yanawa.io

- **Evidence**: `nuxt.config.ts:65` sets `site.url` to `https://weaver.yanawa.io`. `app/composables/usePageMeta.ts:43` builds hreflang links on that origin, and line 73 points `ogImage` at `https://weaver.yanawa.io/og-image.png`. `Agents.md` says not to attach `weaver.yanawa.io` and that this value stays `site.url`. The Worker host in `wrangler.jsonc` is `thread-weaver.kolja.codes`.
- **Impact**: Shares and alternate links describe a host the Worker config is not supposed to claim. Changing `site.url` would contradict the written rule.
- **Change**: Only if the maintainer says the public origin is now `https://thread-weaver.kolja.codes`. Then point `site.url`, the hreflang base, and `ogImage` at that origin, and keep `weaver.yanawa.io` unattached.
- **Priority**: Not ranked against the defects above. No plan.

## Direction

These are options, not defects.

### Preserve a typed draft when the language changes

- **Evidence**: `app/components/LocaleSwitch.vue:54` navigates with `NuxtLink`. `app/composables/useWeaverDraft.ts:55` starts from `createWeaverState()`, then replaces the source with the locale sample when it differs (lines 60–62). `Agents.md` says opening a locale loads that locale's sample sentence.
- **Value**: Someone who pasted a thread and then opens DE or Thai loses the paste. Keeping user text, and loading the sample only when the box still holds the previous sample, would match the control people expect.
- **Trade-off**: It contradicts the current locale rule. Do not build it unless the maintainer changes that sentence. No plan.

### Not worth doing

- Grapheme or weighted counts. `Agents.md` forbids that change unless asked. The packer is word-based on purpose.
- Accounts, history, OAuth, or server storage. Forbidden by `Agents.md`.
- Attaching `weaver.yanawa.io` to the Worker. Forbidden by `Agents.md`.
- Removing the Plus Jakarta name from `nuxt.config.ts`. The page does not use it, and the fonts list is required to keep the name.
- A new visual identity. Out of scope for this survey.

## Not audited

`node_modules` source, `.output`, and the generated docs HTML were not reviewed. Docs markdown under `docs/content` was not read page by page. Speech ranking, marker placement, and the packer were treated as locked behavior and not re-tested. The uncommitted diff in `vitest.config.ts` was left untouched and is not a finding.
