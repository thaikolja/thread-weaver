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

/** Turns the separate refs into one object the templates can read. */
import { reactive } from 'vue'

/** Copy flags. */
import { useWeaverClipboard } from './useWeaverClipboard'

/** Source, posts, and totals. */
import { useWeaverDraft } from './useWeaverDraft'

/** Send, QR, and markdown download. */
import { useWeaverPublish } from './useWeaverPublish'

/** Listen button. */
import { useWeaverSpeech } from './useWeaverSpeech'

/**
 * One editor for the page.
 * Draft edits clear copy checkmarks, stop speech, and close the QR,
 * because segment ids get reused after a fresh pack.
 */
export function useThreadWeaver() {
  /** Filled in once clipboard and publish exist. */
  let resetCopied = (): void => {}

  /** Same idea for the QR modal. */
  let closeQr = (): void => {}

  /** Speech can stop before the other pieces exist. */
  const speech = useWeaverSpeech()

  /** Any real edit tells the other pieces to drop stale UI. */
  const draft = useWeaverDraft(() => {
    // Drop the old copy ticks because the ids are about to be reused.
    resetCopied()

    // Stop any card that was talking.
    speech.stop()

    // Close a QR that shows text which may no longer exist.
    closeQr()
  })

  /** Copy buttons for the posts this draft compiles. */
  const clipboard = useWeaverClipboard(draft.posts)

  /** Send and download use the same posts and the active platform. */
  const publish = useWeaverPublish({
    posts: draft.posts,
    platform: draft.platform
  })

  /** Now the draft callback can reach them. */
  resetCopied = clipboard.reset

  /** Closing the QR from an edit uses the publish helper. */
  closeQr = publish.closeQr

  /** Refs unwrap here, so templates can say weaver.source without .value. */
  return reactive({
    ...draft,
    ...clipboard,
    speakingId: speech.speakingId,
    listen: speech.listen,
    activeQrText: publish.activeQrText,
    send: publish.send,
    openQr: publish.openQr,
    closeQr: publish.closeQr,
    download: publish.download
  })
}
