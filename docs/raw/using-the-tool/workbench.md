---
title: "The workbench"
description: "The parts of the page and what each one is for."
canonical_url: "https://weaver.yanawa.io/using-the-tool/workbench"
---
# The workbench

The page is one screen. The sections share a single editor through `provideWeaver()` and `useWeaver()`. The page file itself does not hold a long list of state.

## Sections

<table>
<thead>
  <tr>
    <th>
      Section
    </th>
    
    <th>
      Component
    </th>
    
    <th>
      What you do there
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Masthead
    </td>
    
    <td>
      <code>
        WeaverHeader
      </code>
    </td>
    
    <td>
      Read the name. The mark is the site logo.
    </td>
  </tr>
  
  <tr>
    <td>
      Platform and source
    </td>
    
    <td>
      <code>
        WeaverWorkbench
      </code>
    </td>
    
    <td>
      Pick a platform, paste text, set the marker and the bridge.
    </td>
  </tr>
  
  <tr>
    <td>
      Text tools
    </td>
    
    <td>
      <code>
        DraftTools
      </code>
    </td>
    
    <td>
      Capitalize posts, finish sentences, or keep line breaks.
    </td>
  </tr>
  
  <tr>
    <td>
      Cards
    </td>
    
    <td>
      <code>
        PostList
      </code>
      
       and <code>
        PostCard
      </code>
    </td>
    
    <td>
      Read each post, reorder it, copy it, or drop it.
    </td>
  </tr>
  
  <tr>
    <td>
      Ship station
    </td>
    
    <td>
      <code>
        ShipStation
      </code>
    </td>
    
    <td>
      See the totals, copy the sequence, or download Markdown.
    </td>
  </tr>
  
  <tr>
    <td>
      QR
    </td>
    
    <td>
      <code>
        QrModal
      </code>
    </td>
    
    <td>
      Scan one post onto a phone.
    </td>
  </tr>
  
  <tr>
    <td>
      Footer
    </td>
    
    <td>
      <code>
        WeaverFooter
      </code>
    </td>
    
    <td>
      The offline note.
    </td>
  </tr>
</tbody>
</table>

## A normal pass

1. Leave the sample sentence or replace it.
2. Pick the platform. The character ring uses that platform's limit.
3. Set the marker and, if you want one, the bridge.
4. Turn on a text tool only when you want that change.
5. Copy a card, copy the whole sequence, or download the Markdown file.

Clear empties the box. The page then shows one empty card so the marker still has a place to sit.


## Sitemap

See the full [sitemap](https://weaver.yanawa.io/sitemap.md) for all pages.
