import { computed } from 'vue'
import type { Ref } from 'vue'
import type { Tag, TagWithCount, Article } from '../types'
import {
  getAllTags,
  getTagBySlug,
  getArticlesByTag,
  getTagsWithCount,
  getRelatedTags,
} from '../utils/tags'
import { useAsyncData } from '#imports'

export interface UseTagsReturn {
  tags: Ref<TagWithCount[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  refresh: () => Promise<void>
  getTag: (slug: string) => Promise<Tag | null>
  getTagsByArticle: (article: Article) => Promise<Tag[]>
  getArticlesByTag: (
    tagSlug: string,
    collectionName?: string
  ) => Promise<Article[]>
  getRelatedTags: (
    tagSlug: string,
    limit?: number,
    collectionName?: string
  ) => Promise<Tag[]>
}

/**
 * Composable for managing tags.
 *
 * The tag list is fetched through `useAsyncData`, so it resolves during SSR and
 * is transferred to the client in the payload rather than refetched on hydration.
 * Call it from a setup context (component `<script setup>`, plugin, or route
 * middleware), as with any Nuxt data composable.
 */
export function useTags(collectionName: string = 'articles'): UseTagsReturn {
  const { data, status, error, refresh } = useAsyncData(
    `content-tags:${collectionName}`,
    () => getTagsWithCount(collectionName),
    { default: () => [] as TagWithCount[] },
  )

  return {
    tags: data as Ref<TagWithCount[]>,
    loading: computed(() => status.value === 'pending'),
    error: computed(() => (error.value as Error | null) ?? null),
    refresh: async () => {
      await refresh()
    },
    getTag: getTagBySlug,
    getTagsByArticle: async (article: Article) => {
      if (!article.tags) return []
      const allTags = await getAllTags()
      return article.tags
        .map(slug => allTags.find(tag => tag.slug === slug))
        .filter((tag): tag is Tag => tag !== undefined)
    },
    getArticlesByTag: (tagSlug: string, collection = collectionName) =>
      getArticlesByTag(tagSlug, collection),
    getRelatedTags: (tagSlug: string, limit = 5, collection = collectionName) =>
      getRelatedTags(tagSlug, limit, collection),
  }
}
