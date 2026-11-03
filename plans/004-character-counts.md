# Plan 004: Name the draft count and the post count separately

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the STOP conditions happens, stop and report. Do not improvise. When done, set this plan's status to DONE in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 4bdac7e..HEAD -- app/components/DraftTools.vue app/components/PostCard.vue i18n/locales/en-US.json i18n/locales/de-DE.json i18n/locales/th-TH.json tests/thread.test.ts`
> On a mismatch with the excerpts below, stop.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `4bdac7e`, 2026-11-03

This is a UX copy change. The category label in the index is UX.

## Why this matters

The tools row counts `source.length`. The ring counts `compiled.length`, which includes the marker and the bridge. Both use the idea of "characters". On the sample post the two numbers differ, and the page does not say why.

## Current state

`app/components/DraftTools.vue` line 63:

```vue
<span class="font-mono text-slate-600">{{ $t('tools.characters', { count: weaver.source.length }) }}</span>
```

`i18n/locales/en-US.json` line 56: `"characters": "{count} characters"`.

`app/components/PostCard.vue` lines 51–54 pass `:length="post.compiled.length"` into `PostLengthRing`. Leave that binding. The ring is the post that will be copied.

`tests/thread.test.ts` compares sorted message keys across `en-US.json`, `de-DE.json`, and `th-TH.json`. A new key must exist in all three files.

Do not change `app/utils/weaver/split.ts`, limits, or how `compiled` is built. Do not change the ring math in `app/utils/weaver/metrics.ts`.

Locale files are JSON. Do not add comments. Keep the existing key order style.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Tests | `bun test` | exit 0 |
| Types | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Browser | Open `/`, `/de/`, and `/th/` | The tools row names the draft. The ring still shows `n/limit` |

## Scope

**In scope**:

- `app/components/DraftTools.vue`
- `i18n/locales/en-US.json`
- `i18n/locales/de-DE.json`
- `i18n/locales/th-TH.json`
- `tests/thread.test.ts` only if an existing assertion pins the old English string `" characters"` in a way that breaks
- `plans/README.md` (status row only)

**Out of scope**:

- `app/components/PostLengthRing.vue` math and colors
- `app/components/PostCard.vue` length binding
- `app/utils/weaver/**`
- `CHANGELOG.md`, `scripts/deploy-cloudflare.mjs`, `wrangler.jsonc`, `vitest.config.ts`
- The ship block "Total Length". It already has its own label.

## Git workflow

- Branch: `advisor/004-character-counts`
- Commit: `fix(ui): name the draft character count`
- Do not push.

## Steps

### Step 1: Add a draft label in all three locales

In each locale file, under `tools`, add a key `draftCharacters` (or replace `characters` if nothing else uses it). Search first:

**Verify**: `rg -n "tools.characters" app` shows only `DraftTools.vue`. If that is the only caller, change the English value of `characters` to `"{count} in the draft"`. German and Thai must change the same key, not a new key, so the key lists stay equal.

If some other caller uses `tools.characters`, add `draftCharacters` in all three files and switch only `DraftTools.vue` to that key.

English copy: `{count} in the draft`.

German: `{count} im Entwurf`.

Thai: `{count} ในฉบับร่าง`.

**Verify**: `bun test` exits 0. The key-set assertion in `tests/thread.test.ts` passes.

### Step 2: Point the tools row at that string

`DraftTools.vue` must still pass `weaver.source.length`. It must not pass `post.compiled.length`.

**Verify**: `rg -n "source.length" app/components/DraftTools.vue` matches. `bun run lint` exits 0. `bun run typecheck` exits 0.

### Step 3: Browser check

Open `/`. The tools row must not say only "characters" for the draft count. The ring must still show a number, a slash, and the platform limit. Open `/de/` and `/th/` and confirm the tools row is translated, not the English string.

**Verify**: that browser check, plus `bun test` exits 0.

## Test plan

No new packer test. The existing locale key comparison in `tests/thread.test.ts` is the regression check. Do not assert the English sentence by copying it into a second constant. If you assert the draft label, read it from `i18n/locales/en-US.json` inside the test.

## Done criteria

- [ ] `bun test` exits 0
- [ ] `bun run typecheck` exits 0
- [ ] `bun run lint` exits 0
- [ ] The tools row still uses `weaver.source.length`
- [ ] `PostCard.vue` still passes `post.compiled.length`
- [ ] en, de, and th have the same message keys
- [ ] Browser check on `/`, `/de/`, and `/th/` was done
- [ ] No files outside the in-scope list are modified
- [ ] `plans/README.md` status row is DONE

## STOP conditions

- `tools.characters` is used for the ring or the ship total. Do not change those labels in this plan.
- German or Thai files do not have a `tools` object.
- The draft count and the ring are already the same string in the current source. They are not: one is `source.length`, the other is `compiled.length`.

## Maintenance notes

If a future change adds the marker into the draft textarea, this label becomes wrong and should be removed. Reviewers should check the three locales, not only English.
