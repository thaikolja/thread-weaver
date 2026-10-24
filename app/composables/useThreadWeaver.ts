import {
  armCopyAllReset,
  compileThread,
  copyAllBody,
  createWeaverState,
  dropSegment,
  intentUrl,
  markdownBody,
  markdownFilename,
  moveSegment,
  platformLabel,
  qrImageUrl,
  readTimeMinutes,
  setBridge,
  setFlatten,
  setMarker,
  setPlacement,
  setPlatform,
  setSource,
  speechCommand,
  totalChars,
  totalWords
}                                                         from '~/utils/thread'
import type { MarkerFormat, MarkerPlacement, PlatformId } from '~/utils/thread'

/**
 * Screen state for the Thread Weaver page.
 *
 * Call this once from `app/pages/index.vue` and pass the refs into the thread components.
 * Packing, markers, totals, and export strings come from `~/utils/thread`.
 * Clipboard, intent tabs, speech, the markdown download, and QR visibility are the only browser calls.
 *
 * @returns Writable source, marker, placement, bridge, and flatten models, the compiled posts,
 * ship-station totals, and the copy / send / listen / download / QR handlers.
 */
export function useThreadWeaver() {
  const weaver      = ref(createWeaverState())
  const copiedPosts = ref<Record<string, boolean>>({})
  const allCopied   = ref(false)
  const speakingId  = ref<string | null>(null)
  const activeQrUrl = ref<string | null>(null)

  const source = computed({
    get: () => weaver.value.source,
    set: (value: string) => {
      weaver.value = setSource(weaver.value, value)
    }
  })

  const marker = computed({
    get: () => weaver.value.marker,
    set: (value: MarkerFormat) => {
      weaver.value = setMarker(weaver.value, value)
    }
  })

  const placement = computed({
    get: () => weaver.value.placement,
    set: (value: MarkerPlacement) => {
      weaver.value = setPlacement(weaver.value, value)
    }
  })

  const bridge = computed({
    get: () => weaver.value.bridge,
    set: (value: string) => {
      weaver.value = setBridge(weaver.value, value)
    }
  })

  const flatten = computed({
    get: () => weaver.value.flatten,
    set: (value: boolean) => {
      weaver.value = setFlatten(weaver.value, value)
    }
  })

  const platform            = computed(() => weaver.value.platform)
  const limit               = computed(() => weaver.value.limit)
  const posts               = computed(() => compileThread(weaver.value))
  const totalCharacterCount = computed(() => totalChars(posts.value))
  const wordCount           = computed(() => totalWords(weaver.value.source))
  const readMinutes         = computed(() => readTimeMinutes(wordCount.value))
  const platformName        = computed(() => platformLabel(platform.value))

  /**
   * Switch the platform corset and pack the source again.
   */
  function choosePlatform(next: PlatformId): void {
    weaver.value = setPlatform(weaver.value, next)
  }

  /** Reorder one segment without packing again. */
  function move(index: number, delta: number): void {
    weaver.value = moveSegment(weaver.value, index, delta)
  }

  /** Remove one segment without reflowing the others. */
  function drop(index: number): void {
    weaver.value = dropSegment(weaver.value, index)
  }

  function writeClipboard(text: string): void {
    if (!import.meta.client || !navigator.clipboard) {
      return
    }
    void navigator.clipboard.writeText(text)
  }

  /** Copy one compiled post and leave that post marked copied. */
  function copyPost(text: string, id: string): void {
    writeClipboard(text)
    copiedPosts.value = { ...copiedPosts.value, [id]: true }
  }

  /** Copy every compiled post and clear the flag after {@link COPY_ALL_RESET_MS}. */
  function copyAll(): void {
    writeClipboard(copyAllBody(posts.value))
    armCopyAllReset((copied) => {
      allCopied.value = copied
    }, (fn, ms) => {
      setTimeout(fn, ms)
    })
  }

  /** Open the platform compose intent in a new tab. */
  function send(compiled: string): void {
    if (!import.meta.client) {
      return
    }
    window.open(intentUrl(platform.value, compiled), '_blank', 'noopener,noreferrer')
  }

  /**
   * Speak one compiled post at rate 1.05.
   * Speaking that same post again cancels. Missing `speechSynthesis` does nothing.
   */
  function listen(text: string, id: string): void {
    const api     = import.meta.client && 'speechSynthesis' in window
    const synth   = api ? window.speechSynthesis : null
    const command = speechCommand(api, speakingId.value, id, text, Boolean(synth?.speaking))
    if (command.type === 'noop' || !synth) {
      return
    }
    if (command.type === 'cancel') {
      synth.cancel()
      speakingId.value = null
      return
    }
    synth.cancel()
    const utterance   = new SpeechSynthesisUtterance(command.text)
    utterance.rate    = command.rate
    utterance.onend   = () => {
      speakingId.value = null
    }
    utterance.onerror = () => {
      speakingId.value = null
    }
    speakingId.value  = id
    synth.speak(utterance)
  }

  /** Show the QR modal for one compiled post. */
  function openQr(text: string): void {
    activeQrUrl.value = qrImageUrl(text)
  }

  /** Dismiss the QR modal. */
  function closeQr(): void {
    activeQrUrl.value = null
  }

  /** Download the compiled thread as markdown. */
  function download(): void {
    if (!import.meta.client) {
      return
    }
    const content = markdownBody(posts.value)
    const blob    = new Blob([ content ], { type: 'text/markdown;charset=utf-8' })
    const url     = URL.createObjectURL(blob)
    const link    = document.createElement('a')
    link.href     = url
    link.download = markdownFilename(platform.value, Date.now())
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    source,
    marker,
    placement,
    bridge,
    flatten,
    platform,
    limit,
    posts,
    totalCharacterCount,
    wordCount,
    readMinutes,
    platformName,
    copiedPosts,
    allCopied,
    speakingId,
    activeQrUrl,
    choosePlatform,
    move,
    drop,
    copyPost,
    copyAll,
    send,
    listen,
    openQr,
    closeQr,
    download
  }
}
