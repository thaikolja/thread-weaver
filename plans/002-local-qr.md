# Plan 002: Render the phone QR in the browser

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the STOP conditions happens, stop and report. Do not improvise. When done, set this plan's status to DONE in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 4bdac7e..HEAD -- app/utils/weaver/publish.ts app/composables/useWeaverPublish.ts app/components/QrModal.vue nuxt.config.ts tests/thread.test.ts README.md`
> If any in-scope file changed, compare the Current state excerpts. On a mismatch, stop. Plan 003 may have added dialog attributes to `QrModal.vue`. Keep those. Only the image source is this plan.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none. If `plans/003-qr-dialog.md` already landed, keep its dialog behavior.
- **Category**: bug
- **Planned at**: commit `4bdac7e`, 2026-11-03

## Why this matters

The QR button sends the compiled post to `api.qrserver.com`. The README says the tool does not call a backend. `nuxt-qrcode` is already installed and unused. Its module defaults are yellow on blue, which must not become the rendered code.

## Current state

`app/utils/weaver/publish.ts` lines 49–51:

```ts
export function qrImageUrl(compiled: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(compiled)}`
}
```

`app/composables/useWeaverPublish.ts` lines 54–55 set `activeQrUrl` to `qrImageUrl(text)`. `app/components/QrModal.vue` lines 40–44 render `<img :src="weaver.activeQrUrl">`.

`nuxt.config.ts` lines 199–206:

```ts
qrcode: {
  options: {
    variant:    'rounded',
    radius:     1,
    blackColor: 'yellow',
    whiteColor: 'blue'
  }
}
```

`tests/thread.test.ts` around line 411 expects `qrImageUrl` to return the `api.qrserver.com` URL. Around line 571 the page source must not contain `<Qrcode`.

`README.md` line 22 says the QR image is loaded from `api.qrserver.com`.

The `Qrcode` component from `nuxt-qrcode` takes a `value` prop. Props on the component override `qrcode.options`.

Copy, send, and download must keep using `compiled`. Listen keeps using `spoken`. Intent URLs stay `intentUrl` in `app/utils/weaver/publish.ts`. Do not change pack, marker, or bridge rules. Version stays `1.0.0`.

Comment style in `.ts` files: a short `/** ... */` on the line above the statement it describes, then a blank line after that statement, unless it is the last statement in the block.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Tests | `bun test` | exit 0 |
| Types | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |

## Scope

**In scope**:

- `app/utils/weaver/publish.ts`
- `app/composables/useWeaverPublish.ts`
- `app/composables/useThreadWeaver.ts` (only if the QR state is renamed and this file re-exports it)
- `app/components/QrModal.vue`
- `nuxt.config.ts` (`qrcode.options` colors only)
- `tests/thread.test.ts`
- `README.md` (the one sentence about `api.qrserver.com`)
- `i18n/locales/en-US.json`, `i18n/locales/de-DE.json`, `i18n/locales/th-TH.json` only if a new visible string is required
- `plans/README.md` (status row only)

**Out of scope**:

- `CHANGELOG.md`, `scripts/deploy-cloudflare.mjs`, `wrangler.jsonc`, `vitest.config.ts`
- Intent URL prefixes in `app/utils/weaver/limits.ts`
- `app/utils/weaver/split.ts` and `app/utils/weaver/compile.ts`
- Accounts, storage, or a server endpoint

## Git workflow

- Branch: `advisor/002-local-qr`
- Commit: `fix(qr): draw the phone code in the browser`
- Do not push.

## Steps

### Step 1: Store the compiled text, not a remote image URL

Change `openQr` so the modal state holds the compiled string (rename `activeQrUrl` to `activeQrText` in `useWeaverPublish.ts` and the re-export in `useThreadWeaver.ts`). `closeQr` still clears it. Do not call `qrImageUrl` from the composable.

Delete `qrImageUrl` if nothing else calls it. Do not replace it with a hand-rolled encoder.

**Verify**: `rg -n "qrImageUrl|api.qrserver.com" app` prints no matches.

### Step 2: Render Qrcode in the modal

In `QrModal.vue`, when the text is non-null, render:

```vue
<Qrcode
  :value="weaver.activeQrText"
  variant="pixelated"
  black-color="#000000"
  white-color="#ffffff"
/>
```

Use the prop names the installed `nuxt-qrcode` README documents (`value`, and the same color props as `qrcode.options`). Keep width and height at 250 if the component accepts them. Keep the existing title, help, and close button.

In `nuxt.config.ts`, set `blackColor` to `#000000` and `whiteColor` to `#ffffff`. Leave `variant` and `radius` unless the component ignores the props above. Yellow on blue must not remain.

**Verify**: `rg -n "api.qrserver.com" app nuxt.config.ts` prints no matches. `rg -n "Qrcode" app/components/QrModal.vue` shows the component. `rg -n "yellow|blue" nuxt.config.ts` does not match the `qrcode` block.

### Step 3: Update the locked tests and the README sentence

In `tests/thread.test.ts`:

- Stop expecting `qrImageUrl(...)` to equal the `api.qrserver.com` URL. If the function was deleted, delete that assertion and its import.
- Replace `expect(source).not.toContain('<Qrcode')` with an assertion that `app/components/QrModal.vue` contains `Qrcode` and does not contain `api.qrserver.com`. Read the file in the test the same way the surrounding test already reads `app/pages/index.vue` with `readFileSync`. Do not reimplement QR encoding.

In `README.md`, replace the sentence that names `api.qrserver.com` with one sentence that the QR is drawn in the browser and the post is not sent out.

**Verify**: `bun test` exits 0. `bun run typecheck` exits 0. `bun run lint` exits 0.

## Test plan

Update `tests/thread.test.ts` only. Pattern: the existing `readFileSync` checks near the bottom of that file. Cases: the modal source contains the local component, and neither the modal nor `publish.ts` contains `api.qrserver.com`.

## Done criteria

- [ ] `bun test` exits 0
- [ ] `bun run typecheck` exits 0
- [ ] `bun run lint` exits 0
- [ ] `rg -n "api.qrserver.com" app tests README.md` prints no matches
- [ ] `QrModal.vue` renders `Qrcode` with the compiled text
- [ ] `qrcode.options` uses black on white
- [ ] Intent URLs are unchanged (`rg -n "x.com/intent/tweet" app/utils/weaver` still matches)
- [ ] No files outside the in-scope list are modified
- [ ] `plans/README.md` status row is DONE

## STOP conditions

- `nuxt-qrcode` does not register a `Qrcode` component, or the prop is not `value`. Stop and report the export you found. Do not add a new QR library.
- Drawing the code requires a network call or a server route.
- Plan 003's dialog markup is present and this plan would remove `role="dialog"` or the Escape handler. Keep them.
- The assumption "the modal receives `compiled`, not `spoken`" is false in `PostActions.vue`. `openQr(post.compiled)` must stay the call site.

## Maintenance notes

A later change to marker text changes the QR payload automatically, because the value is `compiled`. Reviewers should check the modal still closes when the draft changes (`closeQr` on edit is existing behavior in the draft composable). Do not point the QR at the compose URL unless the maintainer asks. The current payload is the post text.
