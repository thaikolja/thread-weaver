# Plan 001: Drop unused install weight and run tests in CI

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the STOP conditions happens, stop and report. Do not improvise. When done, set this plan's status to DONE in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 4bdac7e..HEAD -- package.json bun.lock nuxt.config.ts .gitlab-ci.yml .github/workflows/docs.yml`
> If any of those files changed since this plan was written, compare the Current state excerpts before proceeding. On a mismatch, stop.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `4bdac7e`, 2026-11-03

## Why this matters

`bun install` installs Playwright, an icon collection the page never uses, and an npm package whose name is `latest`. CI then builds the site without running `bun test` or `bun run typecheck`, so a broken packer can still be published.

## Current state

- `package.json` — manifest. Line 25 is `"@iconify-json/simple-icons": "^1.2.101"`. Line 31 is `"@nuxt/scripts": "1.3.12"`. Line 36 is the `nuxt` dependency, not that module. Line 38 is `"playwright": "1.64.1"`. Lines 42 and 46 are `"@nuxt/eslint": "latest"` and `"eslint": "latest"`. Line 49 is `"latest": "^0.2.0"`.
- `nuxt.config.ts` — the modules array at lines 31–41 lists `@nuxt/scripts` at line 36 and `@nuxt/hints` at line 37. No file under `app/` calls them. `@nuxt/image` stays: `ogImage.zeroRuntime` is set at line 195.
- `.gitlab-ci.yml` — job `build-site` (line 15) runs `bun install` and `bun run build:site` only.
- `.github/workflows/docs.yml` — the build job runs `bun install` (line 30) and `bun run build:site` (line 35) only.
- Icons use `i-ph-*` only. Example: `app/components/PlatformIcon.vue` maps platforms to Phosphor names. Bluesky is `i-ph-butterfly-fill` because Phosphor has no Bluesky mark. Do not switch that.

Installed versions on the machine that wrote this plan: eslint `10.14.0`, `@nuxt/eslint` `1.17.0`. Pin those, not a newer tag.

Repo conventions: Bun, not npm. Conventional Commits, lowercase imperative, no final period. Example: `fix(release): retitle the changelog heading to v1.0.0`. Package manager stays Bun. Do not bump `package.json` `"version"` off `1.0.0`.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Tests | `bun test` | exit 0 |
| Types | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Install | `bun install` | exit 0, lockfile updated |

## Scope

**In scope**:

- `package.json`
- `bun.lock`
- `nuxt.config.ts` (only the `modules` array, to drop `@nuxt/scripts` and `@nuxt/hints`)
- `.gitlab-ci.yml`
- `.github/workflows/docs.yml`
- `plans/README.md` (status row only)

**Out of scope**:

- `CHANGELOG.md`, `scripts/deploy-cloudflare.mjs`, and `wrangler.jsonc`. They were already dirty. Do not stage or edit them.
- `vitest.config.ts`. Leave it as you found it.
- `@nuxt/image`, `@nuxt/ui`, `nuxt-qrcode`, and `@iconify-json/ph`.
- Split, marker, copy, speech, and locale behavior.
- `package.json` `"version"`.

## Git workflow

- Branch: `advisor/001-trim-install`
- One commit: `build(deps): drop unused install weight and test in ci`
- Do not push or open a PR.

## Steps

### Step 1: Remove the unused packages

Delete these keys from `package.json` `dependencies` or `devDependencies`: `playwright`, `@iconify-json/simple-icons`, and `latest`.

Set `"@nuxt/eslint"` to `"1.17.0"` and `"eslint"` to `"10.14.0"`.

In `nuxt.config.ts` `modules`, remove `'@nuxt/scripts'` and `'@nuxt/hints'`. Remove the matching dependency lines if nothing else imports them.

Run `bun install`.

**Verify**: `bun pm ls playwright @iconify-json/simple-icons latest` prints nothing installed for those names, or `rg -n '"playwright"|"simple-icons"|"latest"' package.json` finds no matches. `rg -n "@nuxt/scripts|@nuxt/hints" nuxt.config.ts package.json` finds no matches.

### Step 2: Run the gates

**Verify**: `bun test` exits 0. `bun run typecheck` exits 0. `bun run lint` exits 0.

### Step 3: Run those gates in CI before the site build

In `.gitlab-ci.yml`, add a `test` stage before `build`, or add a job `test` that `build-site` needs. The job runs `bun install`, then `bun test`, then `bun run typecheck`. `build-site` must `needs` that job.

In `.github/workflows/docs.yml`, add steps after install and before `bun run build:site`:

```yaml
- name: Test
  run: bun test
- name: Typecheck
  run: bun run typecheck
```

Do not add a deploy step. Do not require `CLOUDFLARE_API_TOKEN`.

**Verify**: `rg -n "bun test" .gitlab-ci.yml .github/workflows/docs.yml` shows both files. `rg -n "bun run typecheck" .gitlab-ci.yml .github/workflows/docs.yml` shows both files.

## Test plan

No new test file. The existing `tests/thread.test.ts` must still pass. The change is the install graph and CI, which those tests do not reimplement.

## Done criteria

- [ ] `bun test` exits 0
- [ ] `bun run typecheck` exits 0
- [ ] `bun run lint` exits 0
- [ ] `package.json` has no `playwright`, `@iconify-json/simple-icons`, or `"latest"` dependency
- [ ] `eslint` and `@nuxt/eslint` are pinned to `10.14.0` and `1.17.0`
- [ ] Both CI files run `bun test` and `bun run typecheck` before `build:site`
- [ ] `git status` shows no edits outside the in-scope list
- [ ] `plans/README.md` status row is DONE

## STOP conditions

- `bun test` or `bun run typecheck` fails after the removals, and a one-line restore of `@nuxt/scripts` or `@nuxt/hints` is what makes it pass. Restore that one module, say which, and stop. Do not keep deleting.
- A file under `app/` or `tests/` imports `playwright` or `simple-icons`. The survey found none.
- The fix seems to require editing `wrangler.jsonc`, `CHANGELOG.md`, or `scripts/deploy-cloudflare.mjs`.

## Maintenance notes

If a browser test is added later, add Playwright as a devDependency in that change, not before. Reviewers should confirm `@nuxt/image` is still present.
