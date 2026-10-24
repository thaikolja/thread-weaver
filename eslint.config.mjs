/** This file is checked as plain JavaScript. */

// @ts-check

/** Nuxt's generated ESLint setup. */
import withNuxt from './.nuxt/eslint.config.mjs'

/** Catches Tailwind classes that are not real utilities. */
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'

/** The attributes that plugin already treats as class lists. */
import { getDefaultAttributes } from 'eslint-plugin-better-tailwindcss/api/defaults'

/** Project lint rules: Nuxt's, plus a check that Tailwind classes exist. */
export default withNuxt(
  betterTailwindcss.configs['correctness-error'],
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        attributes: [
          ...getDefaultAttributes(),
          ['^v-bind:ui$', [{ match: 'objectValues' }]]
        ]
      }
    }
  }
)
