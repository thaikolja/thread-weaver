---
title: "Page and state"
description: "How one editor is shared, and which edits pack the text again."
canonical_url: "https://weaver.yanawa.io/architecture/page-and-state"
---
# Page and state

`index.vue` calls `provideWeaver()` once. Every section calls `useWeaver()` and reads the fields it needs. That is why the page file is not a long list of constants.

`useThreadWeaver()` returns one reactive object. Templates can use `weaver.source` without `.value`.

## What packs again

<table>
<thead>
  <tr>
    <th>
      Edit
    </th>
    
    <th>
      Packs again
    </th>
    
    <th>
      Drops hand-made order
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Source
    </td>
    
    <td>
      Yes
    </td>
    
    <td>
      Yes
    </td>
  </tr>
  
  <tr>
    <td>
      Platform
    </td>
    
    <td>
      Yes
    </td>
    
    <td>
      Yes
    </td>
  </tr>
  
  <tr>
    <td>
      Bridge length
    </td>
    
    <td>
      Yes
    </td>
    
    <td>
      Yes
    </td>
  </tr>
  
  <tr>
    <td>
      Keep line breaks
    </td>
    
    <td>
      Yes
    </td>
    
    <td>
      Yes
    </td>
  </tr>
  
  <tr>
    <td>
      Marker
    </td>
    
    <td>
      No
    </td>
    
    <td>
      No
    </td>
  </tr>
  
  <tr>
    <td>
      Placement
    </td>
    
    <td>
      No
    </td>
    
    <td>
      No
    </td>
  </tr>
  
  <tr>
    <td>
      Capitalize posts
    </td>
    
    <td>
      No
    </td>
    
    <td>
      No
    </td>
  </tr>
  
  <tr>
    <td>
      Finish sentences
    </td>
    
    <td>
      No
    </td>
    
    <td>
      No
    </td>
  </tr>
  
  <tr>
    <td>
      Move or drop
    </td>
    
    <td>
      No
    </td>
    
    <td>
      No
    </td>
  </tr>
</tbody>
</table>

A move that would pass either end returns the same state object. Copy checkmarks, speech, and an open QR are left alone in that case. Any real edit clears them.

## Components

The workbench is `PlatformPicker`, `SourceField`, `MarkerFields`, and `DraftTools`. A card is `PostMoveButtons`, `PostLengthRing`, and `PostActions`. Names are more than one word because the lint rule requires it.


## Sitemap

See the full [sitemap](https://weaver.yanawa.io/sitemap.md) for all pages.
