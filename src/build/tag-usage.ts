/**
 * An index of tag slugs, built as Nuxt Content parses.
 *
 * It records both sides of the relationship, each with the files involved, so
 * that checks are pure functions over the index and only one subscription to
 * the parse hook is ever needed:
 *
 * - which slugs a tag definition declares, and where
 * - which slugs an article references, and where
 *
 * `undefinedSlugs()` is the first such check. Slugs an article references with
 * no definition behind them fail silently at runtime: the lookup returns
 * nothing, the tag renders nowhere, and it has no tag page.
 *
 * This is deliberately not runtime code and never reaches the client bundle.
 */

export interface TagUsageCollectorOptions {
  articlesCollection: string
  tagsCollection: string
}

export interface TagOccurrence {
  slug: string
  /** Content files involved, sorted, for a reproducible message. */
  files: string[]
}

export interface TagUsageCollector {
  record: (collection: string | undefined, content: unknown, file?: string) => void
  /** Slugs declared by a tag definition, with the files declaring them. */
  definedSlugs: () => TagOccurrence[]
  /** Slugs referenced by an article, with the files referencing them. */
  referencedSlugs: () => TagOccurrence[]
  /**
   * Whether any tag definition was seen. Content parsing is cached, so a run
   * can hand over articles while the tags collection stays untouched. Reporting
   * from that state would name every slug in the site as undefined.
   */
  sawTagDefinitions: () => boolean
  /** Referenced slugs that no definition declares. */
  undefinedSlugs: () => TagOccurrence[]
}

function slugOf(content: Record<string, unknown>, file?: string): string | undefined {
  const declared = content.slug
  if (typeof declared === 'string' && declared) {
    return declared
  }

  // The slug is optional in a tags schema, so fall back to the filename, which
  // is what Nuxt Content derives a data entry's key from anyway.
  const stem = file?.split('/').pop()?.replace(/\.[^.]+$/, '')
  return stem || undefined
}

function add(index: Map<string, Set<string>>, slug: string, file?: string) {
  const files = index.get(slug) || new Set<string>()
  if (file) {
    files.add(file)
  }
  index.set(slug, files)
}

function occurrences(index: Map<string, Set<string>>): TagOccurrence[] {
  return Array.from(index.entries())
    .map(([slug, files]) => ({ slug, files: Array.from(files).sort() }))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}

export function createTagUsageCollector(
  options: TagUsageCollectorOptions,
): TagUsageCollector {
  const defined = new Map<string, Set<string>>()
  const referenced = new Map<string, Set<string>>()

  return {
    record(collection, content, file) {
      if (!content || typeof content !== 'object') {
        return
      }

      const record = content as Record<string, unknown>

      if (collection === options.tagsCollection) {
        const slug = slugOf(record, file)
        if (slug) {
          add(defined, slug, file)
        }
        return
      }

      if (collection !== options.articlesCollection) {
        return
      }

      if (!Array.isArray(record.tags)) {
        return
      }

      for (const tag of record.tags) {
        if (typeof tag !== 'string' || !tag) {
          continue
        }
        add(referenced, tag, file)
      }
    },

    definedSlugs() {
      return occurrences(defined)
    },

    referencedSlugs() {
      return occurrences(referenced)
    },

    sawTagDefinitions() {
      return defined.size > 0
    },

    undefinedSlugs() {
      if (defined.size === 0) {
        return []
      }

      return occurrences(referenced).filter(({ slug }) => !defined.has(slug))
    },
  }
}

/** Build the one-off build warning. Exported so its wording is testable. */
export function formatUndefinedTagsWarning(undefinedTags: TagOccurrence[]): string {
  const lines = undefinedTags.map(
    ({ slug, files }) => `  - "${slug}" referenced by ${files.join(', ')}`,
  )

  return [
    `[nuxt-content-tags] ${undefinedTags.length} tag ${
      undefinedTags.length === 1 ? 'slug is' : 'slugs are'
    } referenced by articles but not defined in the tags collection.`,
    ...lines,
    '  These render nowhere and have no tag page. Add a definition, or remove the reference.',
  ].join('\n')
}
