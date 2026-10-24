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

/** The open QR image, if any. */
import { ref } from 'vue'

/** Computed posts and platform passed in from the draft. */
import type { ComputedRef } from 'vue'

/** Links, markdown, and the QR image address. */
import { intentUrl, markdownBody, markdownFilename, qrImageUrl } from '~/utils/weaver/publish'

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

  /** Image URL for the modal. Null hides it. */
  const activeQrUrl = ref<string | null>(null)

  /** Open the platform's compose page in a new tab. */
  function send(compiled: string): void {
    /** No window on the server. */
    if (!import.meta.client) {
      return
    }

    window.open(intentUrl(options.platform.value, compiled), '_blank', 'noopener,noreferrer')
  }

  /** Show a QR for this exact post. */
  function openQr(text: string): void {
    activeQrUrl.value = qrImageUrl(text)
  }

  /** Hide the QR. Also used when the draft changes under an open modal. */
  function closeQr(): void {
    activeQrUrl.value = null
  }

  /** Save the thread as a markdown file. */
  function download(): void {
    /** Downloads need a document. */
    if (!import.meta.client) {
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

    link.href = url

    link.download = markdownFilename(options.platform.value, Date.now())

    link.click()

    /** Drop the temporary address. */
    URL.revokeObjectURL(url)
  }

  return {
    activeQrUrl,
    send,
    openQr,
    closeQr,
    download
  }
}
