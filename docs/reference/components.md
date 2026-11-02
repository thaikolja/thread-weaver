---
title: Components
description: The Vue files that draw the workbench.
---

# Components

Each file is one part of the screen. Interactive parts call `useWeaver()`. A card receives only the post and its index.

## `DraftTools.vue`

Shared editor. Text tools, the raw character count, and Clear.

## `FoldReveal.vue`

Ref callback can receive a component instance when the tag is not a native node.

Section for the payload. A div for the footer.

The block that may start under the fold.

Armed after mount when the block is still below the viewport.

Stays on so a later scroll does not replay the fade.

Scroll position when the block was armed.

True after the page has moved downward.

Native tag from `<component :is>`. A component instance is not the node.

No DOM on the server. Hydration assigns the node on the client.

Some of the block is inside the viewport.

Drop the scroll watch. Called from setup so unmount always reaches it.

First downward scroll that brings the block on screen starts the fade.

A taller window can cover the block without a scroll. Show it in place.

Already on screen. Leaving it visible avoids a flash to nothing.

## `LocaleSwitch.vue`

EN, DE, and TH. Each link opens that language's page.

Path for one locale, such as `/de`.

One link per configured locale.

## `MarkerFields.vue`

Shared editor. Marker, placement, and bridge update the posts as they change.

## `PlatformIcon.vue`

Which corset this mark belongs to.

Class and size land on the one svg that is showing.

## `PlatformPicker.vue`

Button colors for the four corsets.

Shared editor. The page calls provideWeaver().

## `PostActions.vue`

The compiled post these buttons act on.

Shared editor.

## `PostCard.vue`

This card's compiled post and where it sits in the list.

Shared editor. Copy, the limit, and the list length live here.

## `PostLengthRing.vue`

Ring color and how full the circle is.

Compiled length against the active platform limit.

Green when short, red when the post is over the limit.

Darker than the stroke so the digits meet contrast on white.

How much of the ring is still empty.

## `PostList.vue`

Shared editor. The list just reads the compiled posts.

## `PostMoveButtons.vue`

Which card this is, so the first and last arrows can disable themselves.

Shared editor. Move does not repack the text.

## `QrModal.vue`

Shared editor. The modal opens when a post asks for a QR.

## `ShipStation.vue`

Shared editor. Totals and the download live on it.

## `SourceField.vue`

Shared editor.

## `WeaverFooter.vue`

Offline footnote from the template. The QR action still calls a remote image service.

## `WeaverHeader.vue`

Thread Weaver masthead: kicker, wordmark, tagline, and the language switcher.

## `WeaverWorkbench.vue`

Presentational section of the workbench.

