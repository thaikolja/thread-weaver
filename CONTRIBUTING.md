# Contributing

Thread Weaver is the one-page splitter at [weaver.yanawa.io](https://weaver.yanawa.io). The repository is [github.com/thaikolja/thread-weaver](https://github.com/thaikolja/thread-weaver).

## Setup

You need [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Open the URL Bun prints. The home page is the tool.

## Checks

```bash
bun test
bun run typecheck
bun run lint
```

`bun test` runs `tests/thread.test.ts`. Those tests import the modules under `app/utils/weaver/`. Do not reimplement the packer inside a test.

If you change the page, use the control in a browser: type, switch platform, reorder, copy, or listen.

## Version

The release is **1.0.0**. Leave that number in `package.json` unless the maintainer asks for a bump. Do not tag or publish a GitHub Release unless they ask. Record user-visible changes in `CHANGELOG.md`.

## Docs

The VitePress site lives in `/docs`. `scripts/generate-docs.mjs` writes the categories, the pages, and `docs/.vitepress/config.ts`. Edit that script, then run `bun run docs:generate`. A hand edit of a generated page is overwritten the next time the script runs. GitHub Actions rebuilds the site on every push to `main`.

## License

[MIT](LICENSE).
