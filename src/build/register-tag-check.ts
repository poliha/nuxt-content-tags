import { contentFileLabel } from './content-file'
import { createTagUsageCollector, formatUndefinedTagsWarning } from './tag-usage'

/**
 * The hook @nuxt/content calls after parsing each content file. It is not part
 * of Nuxt's own typed hook map, and a rename upstream would disable this check
 * without failing anything, so `test/module-wiring.test.ts` asserts the name
 * still appears in the installed @nuxt/content.
 */
export const CONTENT_PARSE_HOOK = 'content:file:afterParse'

export interface ContentParseContext {
  file?: { id?: string, path?: string }
  content?: unknown
  collection?: { name?: string }
}

/** The slice of Nuxt this needs, so a test does not have to fake the rest. */
export interface HookTarget {
  hook: (name: string, fn: (...args: never[]) => unknown) => unknown
}

export interface TagCheckOptions {
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
 * Content parses during the build, so the report runs after it. In dev the
 * check runs on the initial build only: later edits re-parse through content's
 * own HMR path, which does not fire the build hooks.
 */
export function registerUndefinedTagCheck(
  nuxt: HookTarget,
  options: TagCheckOptions,
): void {
  const warn = options.warn || ((message: string) => console.warn(message))
  const collector = createTagUsageCollector(options)

  nuxt.hook(CONTENT_PARSE_HOOK, ((ctx: ContentParseContext) => {
    const collection = ctx.collection?.name
    if (!collection) {
      return
    }

    collector.record(
      collection,
      ctx.content,
      contentFileLabel(collection, ctx.file?.id, ctx.file?.path),
    )
  }) as (...args: never[]) => unknown)

  let reported = false
  const report = () => {
    if (reported) {
      return
    }

    const undefinedTags = collector.undefinedSlugs()
    if (!undefinedTags.length) {
      return
    }

    reported = true
    warn(formatUndefinedTagsWarning(undefinedTags))
  }

  // Whichever fires first with content parsed wins; the flag keeps it to one.
  nuxt.hook('nitro:build:before', report as (...args: never[]) => unknown)
  nuxt.hook('build:done', report as (...args: never[]) => unknown)
}
