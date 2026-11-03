/** Serve the static Docus build at `/docs` on the same origin as the editor. */
import { createReadStream } from 'node:fs'

/** The Docus `generate` output. `docs:build` writes it. */
import { join } from 'node:path'

/** Status, type, and the file stream. */
import { getRequestURL, sendStream, setResponseHeader, setResponseStatus } from 'h3'

/** Path mapping shared with the tests. */
import { docsContentType, resolveDocsAsset } from '../utils/docs-site'

/** Repository root is the dev and preview working directory. */
const docsRoot = join(process.cwd(), 'docs', '.output', 'public')

export default defineEventHandler((event) => {
  /** Prerender copies the files itself. This handler would overwrite them. */
  if (import.meta.prerender) {
    return
  }

  /** `/de` and `/th` belong to the editor. */
  const asset = resolveDocsAsset(docsRoot, getRequestURL(event).pathname)

  if (!asset) {
    return
  }

  setResponseStatus(event, asset.status)
  setResponseHeader(event, 'content-type', docsContentType(asset.file))

  return sendStream(event, createReadStream(asset.file))
})
