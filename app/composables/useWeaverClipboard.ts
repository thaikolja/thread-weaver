/*
 * Thread Weaver
 *
 * @description     Online tool to split long messages into parts for character-limited platforms
 * @author          Kolja Nolte <kolja.nolte@gmail.com>
 * @copyright       2026 (C) Kolja Nolte
 * @see             https://www.kolja-nolte.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * @package Thread Weaver
 */

/** A ref, and the type of a computed the caller passes in. */
import { ref } from 'vue'
import type { ComputedRef } from 'vue'

/** Turns the copied flag off after 2.5 seconds. */
import { armCopyAllReset } from '~/utils/weaver/speech'

/** The text for "Copy Entire Sequence". */
import { copyAllBody } from '~/utils/weaver/publish'

/** A finished post. */
import type { CompiledPost } from '~/utils/weaver/types'

/**
 * Copy buttons and their checkmarks.
 *
 * @param posts The cards as they look right now.
 */
export function useWeaverClipboard(posts: ComputedRef<readonly CompiledPost[]>) {
  /** Which cards show "Copied". Keyed by post id. */
  const copiedPosts = ref<Record<string, boolean>>({})

  /** The big sequence button's success state. */
  const allCopied = ref(false)

  /** Clear both. Call this when the text on the cards has changed. */
  function reset(): void {
    /** Per-card ticks. */
    copiedPosts.value = {}

    /** And the sequence button. */
    allCopied.value = false
  }

  /** Write text if the browser allows a clipboard. */
  function writeClipboard(text: string): void {
    /** Server render, or a browser with no clipboard. */
    if (!import.meta.client || !navigator.clipboard) {
      return
    }

    void navigator.clipboard.writeText(text)
  }

  /** Copy one card and mark that card. */
  function copyPost(text: string, id: string): void {
    /** Put the published text on the clipboard. */
    writeClipboard(text)

    /** Remember this id so the button can say Copied. */
    copiedPosts.value = { ...copiedPosts.value, [id]: true }
  }

  /** Copy every card, joined with the usual separators. */
  function copyAll(): void {
    /** Whatever the cards say at this moment. */
    writeClipboard(copyAllBody(posts.value))

    /** Show the success label, then hide it. */
    armCopyAllReset((copied) => {
      allCopied.value = copied
    }, (fn, ms) => {
      setTimeout(fn, ms)
    })
  }

  return {
    copiedPosts,
    allCopied,
    copyPost,
    copyAll,
    reset
  }
}
