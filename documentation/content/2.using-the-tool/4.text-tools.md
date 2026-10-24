---
title: Text tools
description: Capitalize posts, finish sentences, and keep line breaks.
---

# Text tools

Three switches sit under the marker fields. Each one has an icon. They replace the old "Flatten blank lines" control, which did not change the packed posts: a blank line was already treated as a space.

## Capitalize posts

The first visible letter of each post becomes uppercase. The chunks are not packed again, so the order stays. `alpha beta` is published as `Alpha beta`.

## Finish sentences

If a post does not already end with `.`, `!`, `?`, `…`, or `...`, the page adds `…`. `Hello.` is left alone. `Hello` becomes `Hello…`. The extra character is part of the published length, so the ring can move.

## Keep line breaks

Off, which is the default, a line break is just another space. `hello` and `world` on two lines become `hello world`.

On, a line break stays in the post, and a blank line stays a blank line. Turning this on packs the source again and drops a hand-made order, because the shape of the chunks can change.
