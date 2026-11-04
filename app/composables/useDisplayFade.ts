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

/** One timer, so a second dip replaces the first. */
let fadeTimer: ReturnType<typeof setTimeout> | undefined

/** Brief opacity dip for the posts below the editor. */
export function useDisplayFade() {
  /** Cards and the ship totals. The header and the editor stay solid. */
  const dimmed = useState('weaver-display-dim', () => false)

  /** Dip, then come back. Typing in the source does not call this. */
  function pulse(): void {
    // Only the browser has a window to watch.
    if (!import.meta.client) {
      // Server render has nothing to dip.
      return
    }

    /** Leave the posts still when the reader asked for less motion. */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Respect the reader's reduced-motion setting.
    if (reduce) {
      // Leave the posts still.
      return
    }

    // Dim the cards for a moment.
    dimmed.value = true

    // A newer pulse replaces the old timer.
    clearTimeout(fadeTimer)

    // Bring the posts back after the short dip.
    fadeTimer = setTimeout(() => {
      // Undo the dip once the short pause is over.
      dimmed.value = false
    }, 220)
  }

  // Expose the flag and the trigger.
  return { dimmed, pulse }
}
