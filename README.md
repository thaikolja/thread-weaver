# Thread Weaver

[![version 1.0.0](https://img.shields.io/badge/version-1.0.0-0f172a)](https://github.com/thaikolja/thread-weaver) [![production](https://img.shields.io/badge/status-production-00c16a)](https://github.com/thaikolja/thread-weaver) [![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org) [![MIT license](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

**Thread Weaver** is a handy tool for posts on social media with character limits: It splits your post into multiple chunks, creating a thread. It supports [X](https://x.com/home), [Bluesky](https://bsky.app/), [Threads](https://www.threads.com/), and [Mastodon](https://mastodon.social/). Everything runs in the browser. Nothing is stored on a server – I don't care about your data.

## What Thread Weaver Offers

- **Live-editing editor** that shows your changes as you type.
- Paste a long post and see it **cut at word boundaries**.
- Switch platform to **match the limits** of X (280), Bluesky (300), Threads (500), and Mastodon (500).
- Choose a **"page" counter** such as `(1/3)`, `[1/3]`, `1/3`, `#1`, or none.
- **Place that counter** under the text, above it, or on the same line.
- Type a **custom bridge**. It shows up in the post as you type.
- **Reorder or drop** a segment without repacking the rest.
- Copy one post, or the **whole sequence**.
- Download a **Markdown file**.
- Open the platform’s compose page. **The tool does not post for you**.
- **Listen to a post**. The voice skips the chunk counter, keeps a bridge you typed, and follows English, German, or Thai with a voice already installed on the machine.
- **Show a QR code** for your phone.

The page is in English and translated to German at `/de`, and Thai at `/th`. The QR image is loaded from `api.qrserver.com`. The rest of the tool does not call a backend.

## Run it Locally

[Bun](https://bun.sh) is the package manager of choice. Install it or replace it with your favorite.

```bash
$ bun install
$ bun run dev --open
```

The browser will start the development server and display the page. The home page *is* the tool.

| Script | What it does |
| --- | --- |
| `bun run dev` | Start the dev server |
| `bun run build` | Build for production |
| `bun run preview` | Serve the build |
| `bun test` | Run the splitter tests |
| `bun run typecheck` | Check TypeScript |
| `bun run lint` | Run ESLint |

## Documentation

For the curious ones, there is an automatically-generated documentation site at the path [/docs](/docs) build off [Nuxt's Docus](https://content.nuxt.com/templates/docus).

On GitLab, where the project's primary repository is hosted, CI/CD is `.gitlab-ci.yml`. On GitHub, where the project is mirrored, GitHub Actions does the same job.

Both configuration files are told to create the documentation site when pushing or merging Thread Weaver to the `main` branch. `bun run docs:dev` previews them. `bun run docs:build` writes the markdown and builds the site.

## Version

**v1.0.0** is the production release, i.e.: the first version where all tests pass. Changes for this release are in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE). We're not barbarians.
