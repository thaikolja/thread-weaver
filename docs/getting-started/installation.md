---
title: Installation
description: Run Thread Weaver locally with Bun.
---

# Installation

You need [Bun](https://bun.sh). The repository is [github.com/thaikolja/thread-weaver](https://github.com/thaikolja/thread-weaver).

## Install and start

```bash
bun install
bun run dev
```

Open the URL Bun prints. The home page is the editor.

## Check the project

| Command | Purpose |
| --- | --- |
| `bun test` | Run the splitter tests in `tests/thread.test.ts` |
| `bun run typecheck` | Check TypeScript |
| `bun run lint` | Run ESLint |
| `bun run docs:dev` | Preview this documentation |
| `bun run docs:build` | Regenerate the markdown and build the VitePress site |

## Documentation site

The guides are a [VitePress](https://vitepress.dev) site in `/docs`. `scripts/generate-docs.mjs` writes the categories and the pages. A GitHub Action rebuilds the site on every push to `main`.
