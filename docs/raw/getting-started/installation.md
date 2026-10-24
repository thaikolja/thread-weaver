---
title: "Installation"
description: "Run Thread Weaver locally with Bun."
canonical_url: "https://weaver.yanawa.io/getting-started/installation"
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

<table>
<thead>
  <tr>
    <th>
      Command
    </th>
    
    <th>
      Purpose
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        bun test
      </code>
    </td>
    
    <td>
      Run the Vitest suite
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        bun run typecheck
      </code>
    </td>
    
    <td>
      Check TypeScript
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        bun run lint
      </code>
    </td>
    
    <td>
      Run ESLint
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        bun run docs:dev
      </code>
    </td>
    
    <td>
      Preview this documentation
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        bun run docs:build
      </code>
    </td>
    
    <td>
      Regenerate the markdown and build the static site into <code>
        /docs
      </code>
    </td>
  </tr>
</tbody>
</table>

## Documentation site

The docs are a separate [Docus](https://docus.dev) app in `documentation/`. A GitHub Action writes the markdown from the source, then runs `nuxt generate`. The static files are written to the `/docs` folder at the root of the repository.


## Sitemap

See the full [sitemap](https://weaver.yanawa.io/sitemap.md) for all pages.
