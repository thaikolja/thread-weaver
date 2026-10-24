---
title: "Overview"
description: "Where the rules live, and where the browser calls live."
canonical_url: "https://weaver.yanawa.io/architecture/overview"
---
# Overview

The rules that decide the posts are pure TypeScript. They do not import Vue, and they do not touch `window`. The Vue layer only holds state and calls the browser.

```text
app/pages/index.vue
  provideWeaver()
    useThreadWeaver()
      useWeaverDraft()      -> app/utils/weaver
      useWeaverClipboard()
      useWeaverSpeech()
      useWeaverPublish()
  sections call useWeaver()
```

## Folders

<table>
<thead>
  <tr>
    <th>
      Path
    </th>
    
    <th>
      Role
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        app/utils/weaver/
      </code>
    </td>
    
    <td>
      Split, compile, totals, links, speech decision
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        app/composables/
      </code>
    </td>
    
    <td>
      The editor the page shares
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        app/components/
      </code>
    </td>
    
    <td>
      The screen, one piece per file
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        app/pages/index.vue
      </code>
    </td>
    
    <td>
      Layout only
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        tests/thread.test.ts
      </code>
    </td>
    
    <td>
      The rules, imported from the real modules
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        documentation/
      </code>
    </td>
    
    <td>
      This Docus site
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        docs/
      </code>
    </td>
    
    <td>
      The static site produced by <code>
        nuxt generate
      </code>
    </td>
  </tr>
</tbody>
</table>

`template.html` at the repository root is the original page. The Nuxt app is the product. Do not load Vue or Tailwind from a CDN.


## Sitemap

See the full [sitemap](https://weaver.yanawa.io/sitemap.md) for all pages.
