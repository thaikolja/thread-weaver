# Thread Weaver

[![version 1.0.0](https://img.shields.io/badge/version-1.0.0-0f172a)](https://github.com/thaikolja/thread-weaver)
[![in development](https://img.shields.io/badge/status-in%20development-f59e0b)](https://github.com/thaikolja/thread-weaver)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MIT license](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

Thread Weaver splits a long post into shorter ones that fit X, Bluesky, Threads, and Mastodon. Everything runs in the browser. Nothing is stored on a server.

This repository is [github.com/thaikolja/thread-weaver](https://github.com/thaikolja/thread-weaver). The working version is **1.0.0**. It is not a production release yet.

## What you can do

- Paste a long text and see it cut on word boundaries.
- Switch platform. The limits are X 280, Bluesky 300, Threads 500, and Mastodon 500.
- Choose a counter such as `(1/3)`, `[1/3]`, `1/3`, `#1`, or none.
- Place that counter under the text, above it, or on the same line.
- Type a custom bridge. It shows up in the post as you type.
- Reorder or drop a segment without repacking the rest.
- Copy one post, or the whole sequence.
- Download a Markdown file.
- Open the platform’s compose page, listen to a post, or show a QR code for your phone.

The QR image is loaded from `api.qrserver.com`. The rest of the tool does not call a backend.

## Run it locally

You need [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Open the URL Bun prints. The home page is the tool.

| Script | What it does |
| --- | --- |
| `bun run dev` | Start the dev server |
| `bun run build` | Build for production |
| `bun run preview` | Serve the build |
| `bun test` | Run the splitter tests |
| `bun run typecheck` | Check TypeScript |
| `bun run lint` | Run ESLint |

## Documentation

The guides are a [Docus](https://docus.dev) site in `documentation/`. `bun run docs:dev` previews them. `bun run docs:build` writes the markdown from the source and builds a static site into the `/docs` folder. The same build runs in GitHub Actions on every push to `main`.

## Version

Stay on **1.0.0** until the maintainer says the tool is ready to release. Do not bump the version in `package.json` unless they ask for that.

## License

[MIT](LICENSE).
