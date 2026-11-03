# Plan 003: Make the phone QR layer a dialog

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the STOP conditions happens, stop and report. Do not improvise. When done, set this plan's status to DONE in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 4bdac7e..HEAD -- app/components/QrModal.vue`
> If `QrModal.vue` changed, compare the Current state. Plan 002 may have replaced the `img` with `Qrcode`. Keep that. This plan only adds dialog behavior.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `4bdac7e`, 2026-11-03

The category is the UI fix. Verification still uses the commands below.

## Why this matters

Opening a QR paints a backdrop `div`. It does not announce as a dialog, does not move focus, and does not close on Escape. The Copy and Send controls behind it stay in the tab order.

## Current state

`app/components/QrModal.vue` lines 27–58: a backdrop `div` with `@click="weaver.closeQr()"`, an inner `div` with `@click.stop`, a title, an image, help text, and a Close button. There is no `role`, no `aria-modal`, and no key listener.

`closeQr` lives in `app/composables/useWeaverPublish.ts` and sets the open state to null. Use that. Do not invent a second close path.

`app/components/PostMoveButtons.vue` lines 34–35 show the existing pattern: `:aria-label` from `$t(...)`. Match that. Do not add a component library dialog.

The page font and colors stay as they are. Do not restyle the card.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Tests | `bun test` | exit 0 |
| Types | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Browser | Open the editor, click Show Chunk as QR Code, press Escape | The layer closes and focus returns to the QR button |

`bun run dev` serves the page. The QR control is the button whose label comes from `actions.qr` in `i18n/locales/en-US.json` ("Show Chunk as QR Code").

## Scope

**In scope**:

- `app/components/QrModal.vue`
- `tests/thread.test.ts` only to assert the dialog attributes exist in that file, if you add a source assertion
- `plans/README.md` (status row only)

**Out of scope**:

- The QR image URL or `Qrcode` component. That is `plans/002-local-qr.md`.
- `app/utils/weaver/publish.ts`
- `CHANGELOG.md`, `scripts/deploy-cloudflare.mjs`, `wrangler.jsonc`, `vitest.config.ts`
- Pack, marker, copy, and speech behavior

## Git workflow

- Branch: `advisor/003-qr-dialog`
- Commit: `fix(ui): close the qr layer from the keyboard`
- Do not push.

## Steps

### Step 1: Dialog semantics

On the inner panel:

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` pointing at an `id` on the existing `h4`

On the backdrop, keep the click-to-close. Add `@keydown.esc="weaver.closeQr()"` on the dialog. Do not close when the event target is inside a text field. There is no text field in this dialog today.

**Verify**: `rg -n 'role="dialog"|aria-modal' app/components/QrModal.vue` matches.

### Step 2: Focus

When the dialog opens, focus the Close button. When it closes, return focus to `document.activeElement` captured before open, if that node is still in the document. Implement this in `QrModal.vue` with `watch` and `onMounted`/`onBeforeUnmount` as needed. Remove the key listener on unmount.

Add `ref` on the Close button. Do not trap focus with a library. Tab from Close may leave the dialog. That is acceptable for this plan. Escape must still close it.

**Verify**: `bun run typecheck` exits 0. `bun run lint` exits 0. `bun test` exits 0.

### Step 3: Browser check

Start `bun run dev` if it is not already running. Open the home page. Click "Show Chunk as QR Code". Confirm the title "Scan to Transfer Segment" is visible. Press Escape. Confirm the layer is gone. Click the control again and click Close. Confirm the layer is gone.

**Verify**: that browser sequence. `bun test` still exits 0.

## Test plan

Optional source assertion in `tests/thread.test.ts`, next to the existing `readFileSync` of the page: `QrModal.vue` contains `role="dialog"` and `aria-modal`. Do not mount Vue. Pattern: the `readFileSync` block already in that file.

## Done criteria

- [ ] `bun test` exits 0
- [ ] `bun run typecheck` exits 0
- [ ] `bun run lint` exits 0
- [ ] `QrModal.vue` has `role="dialog"`, `aria-modal="true"`, and an Escape close
- [ ] The browser check in step 3 was done
- [ ] No files outside the in-scope list are modified
- [ ] `plans/README.md` status row is DONE

## STOP conditions

- `closeQr` is no longer a function on `useWeaver()`.
- Adding a focus trap requires a new dependency.
- The file no longer has a Close button or a title to label the dialog.

## Maintenance notes

If plan 002 replaces the `img`, keep the dialog attributes on the panel. Reviewers should tab once after open and confirm Escape still works.
