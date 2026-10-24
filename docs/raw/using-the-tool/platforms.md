---
title: "Platforms"
description: "The four character limits and what changes when you switch."
canonical_url: "https://weaver.yanawa.io/using-the-tool/platforms"
---
# Platforms

Each platform is a character budget. Switching platform packs the source again and drops any order you arranged by hand.

<table>
<thead>
  <tr>
    <th>
      Platform
    </th>
    
    <th>
      Id
    </th>
    
    <th>
      Limit
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      X
    </td>
    
    <td>
      <code>
        x
      </code>
    </td>
    
    <td>
      280
    </td>
  </tr>
  
  <tr>
    <td>
      Bluesky
    </td>
    
    <td>
      <code>
        bsky
      </code>
    </td>
    
    <td>
      300
    </td>
  </tr>
  
  <tr>
    <td>
      Threads
    </td>
    
    <td>
      <code>
        threads
      </code>
    </td>
    
    <td>
      500
    </td>
  </tr>
  
  <tr>
    <td>
      Mastodon
    </td>
    
    <td>
      <code>
        masto
      </code>
    </td>
    
    <td>
      500
    </td>
  </tr>
</tbody>
</table>

The default is X.

## What the limit means

The packer does not fill the whole limit with your words. It keeps 16 characters for a counter such as `(999/999)`, plus the length of the custom bridge. A single word that is still longer than that budget is left whole. The ring then turns red, `hsl(0, 90%, 45%)`, because the published post can exceed the limit.

Send opens one of these addresses, with the current post encoded on the end:

- `https://x.com/intent/tweet?text=`
- `https://bsky.app/intent/compose?text=`
- `https://www.threads.net/intent/post?text=`
- `https://mastodon.social/share?text=`


## Sitemap

See the full [sitemap](https://weaver.yanawa.io/sitemap.md) for all pages.
