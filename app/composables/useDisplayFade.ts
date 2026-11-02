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

/** One timer per scope, so a second dip replaces the first. */
const fadeTimers: Record<'content' | 'page', ReturnType<typeof setTimeout> | undefined> = {
  content: undefined,
  page: undefined
}

/** Brief opacity dip when the posts change, or when the language changes. */
export function useDisplayFade() {
  /** Cards and the ship totals. A checkbox does not dim the controls around them. */
  const dimmed = useState('weaver-display-dim', () => false)

  /** The whole canvas, only for a locale change. */
  const pageDimmed = useState('weaver-page-dim', () => false)

  /** Dip, then come back. Typing in the source does not call this. */
  function pulse(scope: 'content' | 'page' = 'content'): void {
    if (!import.meta.client) {
      return
    }

    /** Leave the page still when the reader asked for less motion. */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      return
    }

    /** The flag this call is driving. */
    const flag = scope === 'page' ? pageDimmed : dimmed

    flag.value = true

    clearTimeout(fadeTimers[scope])

    fadeTimers[scope] = setTimeout(() => {
      flag.value = false
    }, 220)
  }

  return { dimmed, pageDimmed, pulse }
}
