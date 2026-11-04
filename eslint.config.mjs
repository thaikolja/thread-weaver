/** This file is checked as plain JavaScript. */

// @ts-check

/** Nuxt's generated ESLint setup. */
import withNuxt                 from './.nuxt/eslint.config.mjs'

/** Catches Tailwind classes that are not real utilities. */
import betterTailwindcss        from 'eslint-plugin-better-tailwindcss'

/** The attributes that plugin already treats as class lists. */
import { getDefaultAttributes } from 'eslint-plugin-better-tailwindcss/api/defaults'

/** Registered here so aligned object keys stay valid. */
import stylistic                from '@stylistic/eslint-plugin'

/** Project lint rules: Nuxt's, plus a check that Tailwind classes exist. */
export default withNuxt(
  {
    /** The docs app is its own Nuxt project. Root lint stays on the editor. */
    ignores: [ 'docs/**' ]
  },
  betterTailwindcss.configs['correctness-error'],
  {
    plugins:  {
      '@stylistic': stylistic
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        attributes: [
          ...getDefaultAttributes(),
          [ '^v-bind:ui$', [ { match: 'objectValues' } ] ]
        ]
      }
    },
    rules:    {
      /** `c-*` names are component classes in Vue `<style>` blocks. */
      'better-tailwindcss/no-unknown-classes': [ 'error', {
        ignore: [ '^c-' ]
      } ],

      /** Column alignment is the house style. One space after the colon is still required. */
      '@stylistic/key-spacing': [ 'error', {
        beforeColon: false,
        afterColon:  true,
        mode:        'minimum'
      } ]
    }
  }
)
