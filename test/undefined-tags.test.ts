import { describe, it, expect } from 'vitest'
import { createTagUsageCollector } from '../src/build/tag-usage'
import { contentFileLabel } from '../src/build/content-file'

function collector() {
  return createTagUsageCollector({
    articlesCollection: 'articles',
    tagsCollection: 'tags',
  })
}

describe('createTagUsageCollector', () => {
  it('reports a slug an article references with no matching tag definition', () => {
    const c = collector()
    c.record('tags', { slug: 'nuxt' }, 'content/tags/nuxt.yml')
    c.record('articles', { tags: ['nuxt', 'python'] }, 'content/articles/a.md')

    expect(c.undefinedSlugs()).toEqual([
      { slug: 'python', files: ['content/articles/a.md'] },
    ])
  })

  it('reports nothing when every referenced slug is defined', () => {
    const c = collector()
    c.record('tags', { slug: 'nuxt' }, 'content/tags/nuxt.yml')
    c.record('articles', { tags: ['nuxt'] }, 'content/articles/a.md')

    expect(c.undefinedSlugs()).toEqual([])
  })

  it('lists every article referencing the same undefined slug', () => {
    const c = collector()
    c.record('tags', { slug: 'nuxt' }, 'content/tags/nuxt.yml')
    c.record('articles', { tags: ['ghost'] }, 'content/articles/b.md')
    c.record('articles', { tags: ['ghost'] }, 'content/articles/a.md')

    expect(c.undefinedSlugs()).toEqual([
      { slug: 'ghost', files: ['content/articles/a.md', 'content/articles/b.md'] },
    ])
  })

  it('falls back to the tag file stem when the definition declares no slug', () => {
    const c = collector()
    c.record('tags', { name: 'Nuxt' }, 'content/tags/nuxt.yml')
    c.record('articles', { tags: ['nuxt'] }, 'content/articles/a.md')

    expect(c.undefinedSlugs()).toEqual([])
  })

  it('ignores collections it was not asked about', () => {
    const c = collector()
    c.record('tags', { slug: 'nuxt' }, 'content/tags/nuxt.yml')
    c.record('pages', { tags: ['ghost'] }, 'content/pages/p.md')

    expect(c.undefinedSlugs()).toEqual([])
  })

  it('ignores an article with no tags, and non-string entries', () => {
    const c = collector()
    c.record('tags', { slug: 'nuxt' }, 'content/tags/nuxt.yml')
    c.record('articles', {}, 'content/articles/a.md')
    c.record('articles', { tags: 'nuxt' }, 'content/articles/b.md')
    c.record('articles', { tags: [null, 42, ''] }, 'content/articles/c.md')

    expect(c.undefinedSlugs()).toEqual([])
  })

  it('stays silent when no tag definition was parsed, so a cached tags collection cannot report every slug as undefined', () => {
    const c = collector()
    c.record('articles', { tags: ['nuxt', 'python'] }, 'content/articles/a.md')

    expect(c.sawTagDefinitions()).toBe(false)
    expect(c.undefinedSlugs()).toEqual([])
  })

  it('honours custom collection names', () => {
    const c = createTagUsageCollector({
      articlesCollection: 'posts',
      tagsCollection: 'topics',
    })
    c.record('topics', { slug: 'nuxt' }, 'content/topics/nuxt.yml')
    c.record('posts', { tags: ['ghost'] }, 'content/posts/a.md')

    expect(c.undefinedSlugs()).toEqual([
      { slug: 'ghost', files: ['content/posts/a.md'] },
    ])
  })
})

describe('contentFileLabel', () => {
  it('strips the collection prefix that Nuxt Content puts on a file id', () => {
    expect(
      contentFileLabel('articles', 'articles/articles/getting-started.md', '/abs/content/articles/getting-started.md'),
    ).toBe('articles/getting-started.md')
  })

  it('keeps an id that carries no collection prefix', () => {
    expect(contentFileLabel('articles', 'posts/a.md', undefined)).toBe('posts/a.md')
  })

  it('does not mistake a directory sharing the collection name for the prefix', () => {
    expect(contentFileLabel('articles', 'articlesque/a.md', undefined)).toBe('articlesque/a.md')
  })

  it('falls back to the absolute path when there is no id', () => {
    expect(contentFileLabel('articles', undefined, '/abs/a.md')).toBe('/abs/a.md')
  })

  it('returns undefined when neither is available', () => {
    expect(contentFileLabel('articles', undefined, undefined)).toBeUndefined()
  })
})

describe('the tag index', () => {
  it('records which file declares a slug, so a later check can name it', () => {
    const c = collector()
    c.record('tags', { slug: 'nuxt' }, 'content/tags/nuxt.yml')

    expect(c.definedSlugs()).toEqual([
      { slug: 'nuxt', files: ['content/tags/nuxt.yml'] },
    ])
  })

  it('names every file declaring the same slug, which is how a duplicate looks', () => {
    const c = collector()
    c.record('tags', { slug: 'nuxt' }, 'content/tags/nuxt.yml')
    c.record('tags', { slug: 'nuxt' }, 'content/tags/nuxt-alias.yml')

    expect(c.definedSlugs()).toEqual([
      { slug: 'nuxt', files: ['content/tags/nuxt-alias.yml', 'content/tags/nuxt.yml'] },
    ])
  })

  it('reports referenced slugs whether or not they are defined', () => {
    const c = collector()
    c.record('tags', { slug: 'nuxt' }, 'content/tags/nuxt.yml')
    c.record('articles', { tags: ['nuxt', 'ghost'] }, 'content/articles/a.md')

    expect(c.referencedSlugs().map(t => t.slug)).toEqual(['ghost', 'nuxt'])
  })

  it('leaves a defined slug nothing references visible to an orphan check', () => {
    const c = collector()
    c.record('tags', { slug: 'nuxt' }, 'content/tags/nuxt.yml')
    c.record('tags', { slug: 'unused' }, 'content/tags/unused.yml')
    c.record('articles', { tags: ['nuxt'] }, 'content/articles/a.md')

    const referenced = new Set(c.referencedSlugs().map(t => t.slug))
    const orphans = c.definedSlugs().filter(t => !referenced.has(t.slug))
    expect(orphans).toEqual([
      { slug: 'unused', files: ['content/tags/unused.yml'] },
    ])
  })
})
