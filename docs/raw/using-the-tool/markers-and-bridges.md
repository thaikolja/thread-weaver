---
title: "Markers and bridges"
description: "How counters and the custom bridge are written into each post."
canonical_url: "https://weaver.yanawa.io/using-the-tool/markers-and-bridges"
---
# Markers and bridges

A marker is the small counter on a post. A bridge is the text you type between the post and that counter.

## Markers

<table>
<thead>
  <tr>
    <th>
      Style
    </th>
    
    <th>
      Example
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Parentheses
    </td>
    
    <td>
      <code>
        (1/3)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Brackets
    </td>
    
    <td>
      <code>
        [1/3]
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Raw fraction
    </td>
    
    <td>
      <code>
        1/3
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Number tag
    </td>
    
    <td>
      <code>
        #1
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      None
    </td>
    
    <td>
      The post text only
    </td>
  </tr>
</tbody>
</table>

The default is parentheses. Changing the marker does not pack the text again, so an order you arranged by hand stays put. `none` does not insert a bridge, because there is no counter to attach it to.

## Placement

<table>
<thead>
  <tr>
    <th>
      Placement
    </th>
    
    <th>
      Result
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      New line (bottom)
    </td>
    
    <td>
      The marker sits under the text. A bridge gets its own paragraph.
    </td>
  </tr>
  
  <tr>
    <td>
      Header (top)
    </td>
    
    <td>
      The marker sits above the text. A bridge gets its own paragraph.
    </td>
  </tr>
  
  <tr>
    <td>
      Inline after
    </td>
    
    <td>
      The marker follows the text on the same line.
    </td>
  </tr>
  
  <tr>
    <td>
      Inline before
    </td>
    
    <td>
      The marker leads the text on the same line.
    </td>
  </tr>
</tbody>
</table>

An empty bridge is a blank line, or a single space when the marker is inline. A bridge you type shows up immediately. You do not have to edit the source or change the placement first.

Inline posts join the bridge as a space, the bridge, and a space: `${bridge}`.


## Sitemap

See the full [sitemap](https://weaver.yanawa.io/sitemap.md) for all pages.
