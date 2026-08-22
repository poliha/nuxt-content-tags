/**
 * Identifying a content file the way its author would.
 *
 * Nuxt Content's `file.id` is prefixed with the collection name, so an article
 * at `content/articles/a.md` arrives as `articles/articles/a.md` and reads as a
 * doubled directory. `file.path` is absolute, which is worse in a build
 * message. Any build-time check reporting a file wants this.
 */
export function contentFileLabel(
  collection: string,
  id: string | undefined,
  path: string | undefined,
): string | undefined {
  if (id) {
    const prefix = `${collection}/`
    return id.startsWith(prefix) ? id.slice(prefix.length) : id
  }

  return path
}
