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

/**
 * Bun 1.x does not export Node's `module.findPackageJSON`.
 * Several @nuxtjs/seo packages import that named export, so `nuxt prepare`
 * dies during `bun install` on GitLab's oven/bun image. Rewrite those
 * imports to a local helper and keep every import above that helper so
 * both Bun and jiti can parse the file.
 */

/** File system helpers for the fallback lookup. */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

/** Walk installed packages and compare the invoked script path. */
import { join, resolve as resolvePath } from 'node:path'

/** Detect `bun scripts/patch-nuxt-og-image.mjs` so tests can import this file. */
import { fileURLToPath } from 'node:url'

/** Marker so a second postinstall can skip a file that is already patched. */
export const HELPER_MARKER = '/** Bun stand-in for Node\'s module.findPackageJSON. */'

/** Aliased imports the helper needs. Dropped and re-inserted as one block. */
const HELPER_IMPORTS = [
  'import { existsSync as __findExistsSync, statSync as __findStatSync } from \'node:fs\';',
  'import { createRequire as __findCreateRequire } from \'node:module\';',
  'import { dirname as __findDirname, isAbsolute as __findIsAbsolute, join as __findJoin } from \'node:path\';',
  'import { fileURLToPath as __findFileURLToPath, pathToFileURL as __findPathToFileURL } from \'node:url\';'
].join('\n')

/** Closest `package.json` walker plus bare-specifier resolve. */
const HELPER_FN = `${HELPER_MARKER}
function findPackageJSON(specifier, base) {
  const toPath = (value) => {
    if (value == null) return process.cwd();
    const text = String(value);
    if (text.startsWith('file:')) return __findFileURLToPath(text);
    return text;
  };
  const walk = (start) => {
    let dir = start;
    try {
      if (!__findExistsSync(dir) || !__findStatSync(dir).isDirectory()) dir = __findDirname(dir);
    } catch {
      dir = __findDirname(dir);
    }
    for (;;) {
      const candidate = __findJoin(dir, 'package.json');
      if (__findExistsSync(candidate)) return candidate;
      const parent = __findDirname(dir);
      if (parent === dir) return undefined;
      dir = parent;
    }
  };
  const spec = specifier == null ? '' : String(specifier);
  const bare = spec !== '' && !spec.startsWith('.') && !spec.startsWith('/') && !spec.startsWith('file:') && !__findIsAbsolute(spec);
  if (bare) {
    const basePath = toPath(base);
    const filename = basePath.endsWith('package.json') ? basePath : __findJoin(basePath, 'package.json');
    try {
      return __findCreateRequire(__findPathToFileURL(filename)).resolve(spec + '/package.json');
    } catch {
      try {
        return walk(__findDirname(__findCreateRequire(__findPathToFileURL(filename)).resolve(spec)));
      } catch {
        return undefined;
      }
    }
  }
  if (spec.startsWith('file:')) return walk(__findFileURLToPath(spec));
  if (spec !== '' && (__findIsAbsolute(spec) || spec.startsWith('.'))) {
    const from = spec.startsWith('.') ? __findJoin(__findDirname(toPath(base)), spec) : spec;
    return walk(from);
  }
  return walk(toPath(base));
}`

/** Imports that still pull the missing named export. */
const NAMED_IMPORT = /import\s*\{([^}]*)\}\s*from\s*(['"])node:module\2\s*;?/g

/** Previous patch copies used these aliases in the middle of the import list. */
const OLD_HELPER_IMPORTS = [
  /import \{ existsSync as __findExistsSync, statSync as __findStatSync \} from 'node:fs';\n?/,
  /import \{ dirname as __findDirname, join as __findJoin \} from 'node:path';\n?/,
  /import \{ fileURLToPath as __findFileURLToPath \} from 'node:url';\n?/,
  /import \{ dirname as __findDirname, isAbsolute as __findIsAbsolute, join as __findJoin \} from 'node:path';\n?/,
  /import \{ createRequire as __findCreateRequire \} from 'node:module';\n?/,
  /import \{ fileURLToPath as __findFileURLToPath, pathToFileURL as __findPathToFileURL \} from 'node:url';\n?/
]

/**
 * Drop a function whose body starts at `start`, using brace matching.
 */
function removeBalancedFunction(source, start) {
  /** Opening brace of that function. */
  const brace = source.indexOf('{', start)

  // Leave the file alone when the signature was a false hit.
  if (brace === -1) {
    return source
  }

  let depth = 0

  // Walk until the matching closing brace.
  for (let index = brace; index < source.length; index++) {
    if (source[index] === '{') {
      depth++
    } else if (source[index] === '}') {
      depth--

      if (depth === 0) {
        /** Slice out the function and a trailing newline. */
        let end = index + 1

        if (source[end] === '\n') {
          end++
        }

        return source.slice(0, start) + source.slice(end)
      }
    }
  }

  return source
}

/**
 * Take out every local findPackageJSON helper this script has inserted.
 */
function stripHelperFunction(source) {
  /** Prefer the marked helper so a later source function is left alone. */
  const marked = source.indexOf(HELPER_MARKER)

  if (marked !== -1) {
    return removeBalancedFunction(source, marked)
  }

  /** Older copies had no marker. */
  const legacy = source.indexOf('function findPackageJSON(_specifier, base)')

  if (legacy !== -1) {
    return removeBalancedFunction(source, legacy)
  }

  return source
}

/**
 * Split the leading import block from the rest of the module.
 */
export function splitImports(source) {
  /** Line view so a long @nuxt/kit import stays one statement. */
  const lines = source.split('\n')

  let index = 0
  let depth = 0
  let lastImport = -1

  while (index < lines.length) {
    /** Current line without indent. */
    const trimmed = lines[index].trim()

    if (depth === 0) {
      if (trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')) {
        index++
        continue
      }

      if (!(trimmed.startsWith('import ') || trimmed.startsWith('import{') || trimmed.startsWith('import\'') || trimmed.startsWith('import"'))) {
        break
      }
    }

    depth += (lines[index].match(/\{/g) || []).length - (lines[index].match(/\}/g) || []).length

    if (depth < 0) {
      depth = 0
    }

    lastImport = index
    index++
  }

  if (lastImport === -1) {
    return { prefix: '', rest: source }
  }

  return {
    prefix: lines.slice(0, lastImport + 1).join('\n'),
    rest:   lines.slice(lastImport + 1).join('\n')
  }
}

/**
 * Rewrite one module so Bun can load it. Idempotent.
 */
export function patchSource(source) {
  /** Named import of the missing export. */
  const pullsNamedExport = /import\s*\{[^}]*\bfindPackageJSON\b[^}]*\}\s*from\s*['"]node:module['"]/.test(source)

  /** Helper sitting between import statements, which jiti cannot parse. */
  const functionBeforeImport = source.includes('function findPackageJSON') && /function findPackageJSON[\s\S]*\nimport\s/.test(source)

  // Already in the shape we want.
  if (source.includes(HELPER_MARKER) && !pullsNamedExport && !functionBeforeImport) {
    return { next: source, changed: false }
  }

  // Nothing in this file talks to the missing export.
  if (!pullsNamedExport && !source.includes('function findPackageJSON') && !source.includes('findPackageJSON')) {
    return { next: source, changed: false }
  }

  if (!pullsNamedExport && !source.includes('function findPackageJSON')) {
    return { next: source, changed: false }
  }

  let next = source

  // Drop a previous helper so we can put it after the imports.
  next = stripHelperFunction(next)

  // Drop the aliased helper imports; they go back in as one block.
  for (const pattern of OLD_HELPER_IMPORTS) {
    next = next.replace(pattern, '')
  }

  // Keep createRequire and friends; drop only findPackageJSON.
  next = next.replace(NAMED_IMPORT, (full, inner, quote) => {
    /** Specifiers that stay on the node:module import. */
    const kept = inner.split(',').map(part => part.trim()).filter(Boolean).filter((part) => {
      /** Left-hand name before `as`. */
      const name = part.split(/\s+as\s+/)[0].trim()

      return name !== 'findPackageJSON'
    })

    if (kept.length === 0) {
      return ''
    }

    return `import { ${kept.join(', ')} } from ${quote}node:module${quote};`
  })

  // Collapse blank lines the import rewrite leaves behind.
  next = next.replace(/\n{3,}/g, '\n\n')

  /** Import block, then the rest of the file. */
  const { prefix, rest } = splitImports(next)

  /** Patched module with the helper below every import. */
  const patched = `${prefix}\n${HELPER_IMPORTS}\n${HELPER_FN}\n${rest.replace(/^\n+/, '\n')}`

  return { next: patched, changed: patched !== source }
}

/**
 * Patch one generated file on disk.
 */
export function patchFile(file) {
  /** Read the generated module. */
  const source = readFileSync(file, 'utf8')

  /** Skip files that never import the missing export. */
  if (!source.includes('findPackageJSON') || !source.includes('node:module')) {
    return false
  }

  /** Rewritten source plus whether anything moved. */
  const { next, changed } = patchSource(source)

  if (!changed) {
    return false
  }

  writeFileSync(file, next)

  return true
}

/**
 * Walk an install tree and patch every affected module.
 */
export function walk(dir) {
  // Skip a missing folder, which happens before the dependency is installed.
  if (!existsSync(dir)) {
    return
  }

  // Visit every entry in this folder.
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.cache' || entry.name === '.git' || entry.name === 'coverage') {
      continue
    }

    /** Full path of this entry. */
    const full = join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(full)
    } else if (entry.name.endsWith('.mjs') || entry.name.endsWith('.js')) {
      patchFile(full)
    }
  }
}

/** True when this file is the process entry, not an imported helper. */
const invoked = Boolean(process.argv[1]) && resolvePath(process.argv[1]) === fileURLToPath(import.meta.url)

if (invoked) {
  walk(join(process.cwd(), 'node_modules'))
}
