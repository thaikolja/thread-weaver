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

/** Marks the object child components can inject. */
import type { InjectionKey } from 'vue'

/** Builds the shared editor. */
import { useThreadWeaver } from './useThreadWeaver'

/** One editor for the whole page. */
export const weaverKey: InjectionKey<ReturnType<typeof useThreadWeaver>> = Symbol('weaver')

/** Create the editor and make it available under this page. */
export function provideWeaver(): void {
  /** Draft, clipboard, speech, and publish, as one reactive object. */
  const weaver = useThreadWeaver()

  /** Sections below call useWeaver() instead of taking a pile of props. */
  provide(weaverKey, weaver)
}

/** The editor from the nearest provideWeaver(). */
export function useWeaver(): ReturnType<typeof useThreadWeaver> {
  /** Empty when a component is rendered outside the page. */
  const weaver = inject(weaverKey)

  /** Fail here so a missing provider is obvious. */
  if (!weaver) {
    throw new Error('useWeaver() must be used inside provideWeaver()')
  }

  return weaver
}
