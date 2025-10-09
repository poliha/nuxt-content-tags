import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Tag, TagWithCount, Article } from '../types'
import {
  getAllTags,
  getTagBySlug,
  getArticlesByTag,
  getTagsWithCount,
  getRelatedTags,
} from '../utils/tags'

export interface UseTagsReturn {
  tags: Ref<TagWithCount[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
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
 * Composable for managing tags
 */
export function useTags(collectionName: string = 'articles'): UseTagsReturn {
  const tags = ref<TagWithCount[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Load tags on init
  const loadTags = async () => {
    try {
      loading.value = true
      error.value = null
      tags.value = await getTagsWithCount(collectionName)
    }
    catch (e) {
      error.value = e as Error
      console.error('[useTags] Error loading tags:', e)
    }
    finally {
      loading.value = false
    }
  }

  // Load tags immediately
  loadTags()

  return {
    tags,
    loading,
    error,
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
