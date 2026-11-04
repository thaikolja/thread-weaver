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

/** The compiled post shown as a QR, if any. */
import { ref } from 'vue'

/** Computed posts and platform passed in from the draft. */
import type { ComputedRef } from 'vue'

/** Links and the markdown download. The QR is drawn in the modal. */
import { intentUrl, markdownBody, markdownFilename } from '~/utils/weaver/publish'

/** Types for those arguments. */
import type { CompiledPost, PlatformId } from '~/utils/weaver/types'

/**
 * Send, phone QR, and the markdown download.
 * They read the cards at the moment you click.
 */
export function useWeaverPublish(options: {
  posts: ComputedRef<readonly CompiledPost[]>
  platform: ComputedRef<PlatformId>
}) {
  /** Headings in the downloaded file follow the active locale. */
  const { t } = useI18n()

  /** Compiled post in the modal. Null hides it. */
  const activeQrText = ref<string | null>(null)

  /** Open the platform's compose page in a new tab. */
  function send(compiled: string): void {
    /** No window on the server. */
    if (!import.meta.client) {
      // Nothing to open during server render.
      return
    }

    // Open the platform's compose page in a fresh tab.
    window.open(intentUrl(options.platform.value, compiled), '_blank', 'noopener,noreferrer')
  }

  /** Show a QR for this exact post. */
  function openQr(text: string): void {
    // Remember the exact post the modal should draw.
    activeQrText.value = text
  }

  /** Hide the QR. Also used when the draft changes under an open modal. */
  function closeQr(): void {
    // Null hides the modal.
    activeQrText.value = null
  }

  /** Save the thread as a markdown file. */
  function download(): void {
    /** Downloads need a document. */
    if (!import.meta.client) {
      // No browser, so there is no file to save.
      return
    }

    /** The file body. English stays `Post 1`. */
    const content = markdownBody(options.posts.value, index => t('markdown.heading', { index }))

    /** A blob the browser can save. */
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })

    /** Temporary address for the click. */
    const url = URL.createObjectURL(blob)

    /** A hidden link with the file name. */
    const link = document.createElement('a')

    // Point the link at the temporary blob address.
    link.href = url

    // Use the thread name and the current timestamp.
    link.download = markdownFilename(options.platform.value, Date.now())

    // A programmatic click starts the download.
    link.click()

    /** Drop the temporary address. */
    URL.revokeObjectURL(url)
  }

  // Expose the modal state and the three publish actions.
  return {
    activeQrText,
    send,
    openQr,
    closeQr,
    download
  }
}
