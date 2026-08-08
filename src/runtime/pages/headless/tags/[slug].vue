<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  getTagBySlug,
  getArticlesByTag,
  getRelatedTags,
} from '../../../utils/tags'
import type { ModuleOptions } from '../../../../module'

const route = useRoute()
const tagSlug = route.params.slug as string

// Get module config
const config = useRuntimeConfig().public.contentTags as ModuleOptions

// Fetched through useAsyncData so the page renders server-side
const { data } = await useAsyncData(`content-tags:tag:${tagSlug}`, async () => {
  const tag = await getTagBySlug(tagSlug)
  if (!tag) return null

  // Sort by date (newest first)
  const articles = (await getArticlesByTag(tagSlug)).sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })

  const relatedTags = config.pages?.tag?.showRelated
    ? await getRelatedTags(tagSlug, config.pages?.tag?.relatedLimit || 5)
    : []

  return { tag, articles, relatedTags }
})

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Tag not found',
    fatal: true,
  })
}

const tag = computed(() => data.value?.tag)
const articles = computed(() => data.value?.articles ?? [])
const relatedTags = computed(() => data.value?.relatedTags ?? [])

// SEO
const titleTemplate = config.pages?.tag?.titleTemplate || '%s - Tags'
const title = computed(() =>
  titleTemplate.replace('%s', tag.value?.name || ''),
)
const description = computed(
  () => tag.value?.description || `Articles tagged with ${tag.value?.name}`,
)

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})
</script>

<template>
  <div
    v-if="tag"
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
  >
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {{ tag.name }}
      </h1>
      <p
        v-if="tag.description"
        class="mt-2 text-lg text-gray-600 dark:text-gray-400"
      >
        {{ tag.description }}
      </p>
      <div class="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
        <NuxtLink
          :to="config.basePath"
          class="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          All tags
        </NuxtLink>
        <span>&bull;</span>
        <span>
          {{ articles.length }} article{{ articles.length === 1 ? '' : 's' }}
        </span>
      </div>
    </div>

    <!-- Related Tags -->
    <div
      v-if="relatedTags.length > 0"
      class="mb-8"
    >
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Related Tags
      </h3>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink
          :to="config.basePath"
          class="inline-flex items-center rounded-md text-sm px-2.5 py-1 font-medium border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
        >
          All tags
        </NuxtLink>
        <NuxtLink
          v-for="relatedTag in relatedTags"
          :key="relatedTag.slug"
          :to="`${config.basePath}/${relatedTag.slug}`"
          class="inline-flex items-center rounded-md text-sm px-2.5 py-1 font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer hover:scale-105 transition-transform"
        >
          {{ relatedTag.name }}
        </NuxtLink>
      </div>
    </div>

    <!-- Articles -->
    <div v-if="articles.length > 0">
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Articles
      </h3>
      <div class="space-y-4">
        <NuxtLink
          v-for="article in articles"
          :key="article.path"
          :to="article.path"
          class="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <h4 class="font-semibold mb-1 text-gray-900 dark:text-white">
            {{ article.title }}
          </h4>
          <p
            v-if="article.description"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            {{ article.description }}
          </p>
        </NuxtLink>
      </div>
    </div>

    <div
      v-else
      class="text-center py-12"
    >
      <p class="text-gray-500 dark:text-gray-400">
        No articles found with this tag
      </p>
      <NuxtLink
        :to="config.basePath"
        class="inline-block mt-4 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline"
      >
        View all tags
      </NuxtLink>
    </div>
  </div>
</template>
