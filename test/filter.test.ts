import { describe, it, expect, afterEach } from 'vitest'
import {
  getArticlesByTag,
  getTagsWithCount,
  getRelatedTags,
} from '../src/runtime/utils/tags'
import type { Article } from '../src/runtime/types'
import { setCollections, resetCollections } from './stubs/imports'

const tags = [
  { name: 'Nuxt', slug: 'nuxt' },
  { name: 'Testing', slug: 'testing' },
]

const articles: Article[] = [
  { path: '/published', title: 'Published', draft: false, tags: ['nuxt', 'testing'] },
  { path: '/scheduled', title: 'Scheduled', draft: true, tags: ['nuxt'] },
]

function stubCollections() {
  setCollections((name: string) => ({
    all: async () => (name === 'tags' ? tags : articles),
  }))
}

// Only articles the surrounding site considers published
const publishedOnly = (article: Article) => article.draft !== true

describe('article filter', () => {
  afterEach(() => {
    resetCollections()
  })

  describe('getArticlesByTag', () => {
    it('returns every tagged article when no filter is given', async () => {
      stubCollections()
      const result = await getArticlesByTag('nuxt')
      expect(result.map(a => a.title)).toEqual(['Published', 'Scheduled'])
    })

    it('excludes articles the filter rejects', async () => {
      stubCollections()
      const result = await getArticlesByTag('nuxt', 'articles', publishedOnly)
      expect(result.map(a => a.title)).toEqual(['Published'])
    })
  })

  describe('getTagsWithCount', () => {
    it('counts every tagged article when no filter is given', async () => {
      stubCollections()
      const result = await getTagsWithCount()
      expect(result.find(t => t.slug === 'nuxt')?.count).toBe(2)
    })

    it('counts only articles the filter accepts', async () => {
      stubCollections()
      const result = await getTagsWithCount('articles', publishedOnly)
      expect(result.find(t => t.slug === 'nuxt')?.count).toBe(1)
    })

    it('drops tags left with no articles after filtering', async () => {
      stubCollections()
      const onlyScheduled = (article: Article) => article.draft === true
      const result = await getTagsWithCount('articles', onlyScheduled)
      // testing only appears on the published article
      expect(result.map(t => t.slug)).toEqual(['nuxt'])
    })
  })

  describe('getRelatedTags', () => {
    it('derives related tags from the filtered set', async () => {
      stubCollections()
      const unfiltered = await getRelatedTags('nuxt')
      expect(unfiltered.map(t => t.slug)).toEqual(['testing'])

      const onlyScheduled = (article: Article) => article.draft === true
      const filtered = await getRelatedTags('nuxt', 5, 'articles', onlyScheduled)
      expect(filtered).toEqual([])
    })
  })
})
