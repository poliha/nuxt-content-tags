import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseYAML } from 'confbox'
import type { TagUsageCollector } from './tag-usage'

/**
 * Feeding the tag index from the content files on disk.
 *
 * Nuxt Content caches parsing per file, and its parse hook fires only for the
 * files it re-parses. An index built from the hook therefore sees whichever
 * files changed since the last build: it misses undefined slugs in unchanged
 * articles, and reports slugs as undefined when their definition was cached.
 * Reading the sources gives every build the whole picture.
 *
 * The layout is the one the README documents: `content/<articles>/*.md` and
 * `content/<tags>/*.yml`. Custom sources arrive with configurable collections.
 */

export interface ContentSourceOptions {
  rootDir: string
  articlesCollection: string
  tagsCollection: string
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

async function listFiles(dir: string, extension: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries
      .filter(entry => entry.isFile() && entry.name.endsWith(extension))
      .map(entry => entry.name)
      .sort()
  }
  catch {
    // A missing folder means nothing to check, not a broken build.
    return []
  }
}

/** Parse YAML, returning undefined for a file Nuxt Content will report itself. */
function parseData(source: string): unknown {
  try {
    return parseYAML(source)
  }
  catch {
    return undefined
  }
}

async function recordFolder(
  collector: TagUsageCollector,
  contentDir: string,
  collection: string,
  extension: string,
  extract: (source: string) => unknown,
) {
  const dir = join(contentDir, collection)
  for (const name of await listFiles(dir, extension)) {
    const source = await readFile(join(dir, name), 'utf8')
    collector.record(collection, extract(source), `${collection}/${name}`)
  }
}

export async function recordContentSources(
  collector: TagUsageCollector,
  options: ContentSourceOptions,
): Promise<void> {
  const contentDir = join(options.rootDir, 'content')

  await recordFolder(collector, contentDir, options.tagsCollection, '.yml', parseData)
  await recordFolder(collector, contentDir, options.articlesCollection, '.md', (source) => {
    const match = source.match(FRONTMATTER)
    return match ? parseData(match[1] || '') : undefined
  })
}
