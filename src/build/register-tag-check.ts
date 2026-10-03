import { recordContentSources } from './content-sources'
import { createTagUsageCollector, formatUndefinedTagsWarning } from './tag-usage'

/** The slice of Nuxt this needs, so a test does not have to fake the rest. */
export interface HookTarget {
  hook: (name: string, fn: (...args: never[]) => unknown) => unknown
}

export interface TagCheckOptions {
  rootDir: string
  articlesCollection: string
  tagsCollection: string
  warn?: (message: string) => void
}

/**
 * Report tag slugs referenced by articles that no tag definition declares.
 *
 * They fail silently at runtime: the lookup returns nothing, the tag renders
 * nowhere, and it has no tag page. This warns and never fails the build.
 *
 * It reads the content files when the build gets going, so it sees every file
 * whether or not Nuxt Content's parse cache was warm. In dev it runs once, when
 * the server starts.
 */
export function registerUndefinedTagCheck(
  nuxt: HookTarget,
  options: TagCheckOptions,
): void {
  const warn = options.warn || ((message: string) => console.warn(message))

  let ran = false
  const report = async () => {
    if (ran) {
      return
    }
    ran = true

    const collector = createTagUsageCollector(options)
    await recordContentSources(collector, options)

    const undefinedTags = collector.undefinedSlugs()
    if (undefinedTags.length) {
      warn(formatUndefinedTagsWarning(undefinedTags))
    }
  }

  // Whichever fires first runs the check; the flag keeps it to one.
  nuxt.hook('nitro:build:before', report as (...args: never[]) => unknown)
  nuxt.hook('build:done', report as (...args: never[]) => unknown)
}
