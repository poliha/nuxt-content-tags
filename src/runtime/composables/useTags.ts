import { computed } from 'vue'
import type { Ref } from 'vue'
import type { Tag, TagWithCount, Article, ArticleFilter } from '../types'
import {
  getAllTags,
  getTagBySlug,
  getArticlesByTag,
  getTagsWithCount,
  getRelatedTags,
} from '../utils/tags'
import { useAsyncData } from '#imports'

export interface UseTagsOptions {
  /**
   * Restrict which articles are counted and listed. Applies to every query the
   * composable makes, so tag pages stay consistent with the rest of the site
   * (e.g. hiding future-dated posts in production).
   */
  filter?: ArticleFilter
}

export interface UseTagsReturn {
  tags: Ref<TagWithCount[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  refresh: () => Promise<void>
  getAllTags: () => Promise<Tag[]>
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
export function useTags(
  collectionName: string = 'articles',
  options: UseTagsOptions = {},
): UseTagsReturn {
  const { filter } = options

  const { data, status, error, refresh } = useAsyncData(
    `content-tags:${collectionName}`,
    () => getTagsWithCount(collectionName, filter),
    { default: () => [] as TagWithCount[] },
  )

  return {
    tags: data as Ref<TagWithCount[]>,
    loading: computed(() => status.value === 'pending'),
    error: computed(() => (error.value as Error | null) ?? null),
    refresh: async () => {
      await refresh()
    },
    // Every defined tag, including ones no article currently uses. `tags` is the
    // counted, filtered view; this is the raw list for looking up metadata.
    getAllTags,
    getTag: getTagBySlug,
    getTagsByArticle: async (article: Article) => {
      if (!article.tags) return []
      const allTags = await getAllTags()
      return article.tags
        .map(slug => allTags.find(tag => tag.slug === slug))
        .filter((tag): tag is Tag => tag !== undefined)
    },
    getArticlesByTag: (tagSlug: string, collection = collectionName) =>
      getArticlesByTag(tagSlug, collection, filter),
    getRelatedTags: (tagSlug: string, limit = 5, collection = collectionName) =>
      getRelatedTags(tagSlug, limit, collection, filter),
  }
}
