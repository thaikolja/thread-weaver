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

import type { PlatformId } from './types'

/** Resting look for a platform button that is not selected. */
const idlePlatform = 'border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'

/** Selected look for each corset. Colors match the template. */
const activePlatform: Record<PlatformId, string> = {
  x: 'border-black bg-black font-semibold text-white shadow-sm',
  bsky: 'border-[#0085ff] bg-[#0085ff] font-semibold text-white shadow-sm',
  threads: 'border-transparent bg-gradient-to-r from-pink-500 to-amber-500 font-semibold text-white shadow-sm',
  masto: 'border-[#6364ff] bg-[#6364ff] font-semibold text-white shadow-sm'
}

/**
 * Classes for one platform button.
 * Active buttons use the brand color. The others stay quiet.
 */
export function platformButtonClass(platform: PlatformId, active: PlatformId): string {
  /** Highlight only the corset that is on. */
  if (platform === active) {
    // The selected button gets its brand color.
    return activePlatform[platform]
  }

  // Everyone else stays quiet.
  return idlePlatform
}
