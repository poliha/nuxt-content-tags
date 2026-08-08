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
  <UContainer
    v-if="tag"
    class="py-12"
  >
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">
        {{ tag.name }}
      </h1>
      <p
        v-if="tag.description"
        class="mt-2 text-lg text-(--ui-text-muted)"
      >
        {{ tag.description }}
      </p>
      <div class="flex items-center gap-2 mt-4 text-sm text-(--ui-text-muted)">
        <ULink
          :to="config.basePath"
          active-class="text-(--ui-primary)"
          inactive-class="hover:text-(--ui-primary)"
        >
          All tags
        </ULink>
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
      <h3 class="text-lg font-semibold mb-4">
        Related Tags
      </h3>
      <div class="flex gap-2 flex-wrap">
        <UBadge
          color="primary"
          variant="outline"
        >
          <NuxtLink :to="config.basePath">
            All tags
          </NuxtLink>
        </UBadge>
        <UBadge
          v-for="relatedTag in relatedTags"
          :key="relatedTag.slug"
          :color="(relatedTag.color as any) || 'neutral'"
          variant="subtle"
          class="cursor-pointer hover:scale-105 transition-transform"
        >
          <NuxtLink :to="`${config.basePath}/${relatedTag.slug}`">
            {{ relatedTag.name }}
          </NuxtLink>
        </UBadge>
      </div>
    </div>

    <!-- Articles -->
    <div v-if="articles.length > 0">
      <h3 class="text-lg font-semibold mb-4">
        Articles
      </h3>
      <div class="space-y-4">
        <NuxtLink
          v-for="article in articles"
          :key="article.path"
          :to="article.path"
          class="block"
        >
          <UCard class="hover:ring-(--ui-primary) transition-colors">
            <h4 class="font-semibold mb-1">
              {{ article.title }}
            </h4>
            <p
              v-if="article.description"
              class="text-sm text-(--ui-text-muted)"
            >
              {{ article.description }}
            </p>
          </UCard>
        </NuxtLink>
      </div>
    </div>

    <div
      v-else
      class="text-center py-12"
    >
      <p class="text-(--ui-text-muted)">
        No articles found with this tag
      </p>
      <UButton
        :to="config.basePath"
        variant="link"
        class="mt-4"
      >
        View all tags
      </UButton>
    </div>
  </UContainer>
</template>
