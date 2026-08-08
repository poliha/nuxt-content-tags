<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useTags } from '../../../composables/useTags'
import type { Tag } from '../../../types'
import type { ModuleOptions } from '../../../../module'

const route = useRoute()
const tagSlug = route.params.slug as string

const { getTag, getArticlesByTag, getRelatedTags } = useTags()

const tag = ref<Tag | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const articles = ref<any[]>([])
const relatedTags = ref<Tag[]>([])
const loading = ref(true)

// Get module config
const config = useRuntimeConfig().public.contentTags as ModuleOptions

onMounted(async () => {
  try {
    // Load tag metadata
    tag.value = await getTag(tagSlug)

    if (!tag.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tag not found',
        fatal: true,
      })
    }

    // Load articles with this tag
    const allArticles = await getArticlesByTag(tagSlug)
    // Sort by date (newest first)
    articles.value = allArticles.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })

    // Load related tags if enabled
    if (config.pages?.tag?.showRelated) {
      const limit = config.pages?.tag?.relatedLimit || 5
      relatedTags.value = await getRelatedTags(tagSlug, limit)
    }
  }
  finally {
    loading.value = false
  }
})

// SEO
watchEffect(() => {
  if (!tag.value) return

  const titleTemplate = config.pages?.tag?.titleTemplate || '%s - Tags'
  const title = titleTemplate.replace('%s', tag.value.name)

  useSeoMeta({
    title,
    description:
      tag.value.description || `Articles tagged with ${tag.value.name}`,
    ogTitle: title,
    ogDescription:
      tag.value.description || `Articles tagged with ${tag.value.name}`,
  })
})
</script>

<template>
  <UContainer
    v-if="tag && !loading"
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

  <div
    v-else-if="loading"
    class="text-center py-12"
  >
    <p class="text-(--ui-text-muted)">
      Loading...
    </p>
  </div>
</template>
