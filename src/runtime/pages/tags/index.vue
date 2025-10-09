<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useTags } from '../../composables/useTags'
import type { ModuleOptions } from '../../../module'

const { tags, loading } = useTags()

// Sort tags by count (most used first) then by name
const sortedTags = computed(() => {
  return [...tags.value].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.name.localeCompare(b.name)
  })
})

// Get module config
const config = useRuntimeConfig().public.contentTags as ModuleOptions

useSeoMeta({
  title: config.pages?.index?.title || 'Tags',
  description: config.pages?.index?.description || 'Browse content by tags',
})
</script>

<template>
  <UPage>
    <UPageHero
      :title="config.pages?.index?.title || 'Tags'"
      :description="
        config.pages?.index?.description || 'Browse content by tags'
      "
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
      }"
    />
    <UPageSection
      :ui="{
        container: '!pt-0',
      }"
    >
      <div
        v-if="loading"
        class="text-center py-12"
      >
        <p class="text-muted">
          Loading tags...
        </p>
      </div>

      <div
        v-else-if="sortedTags.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <NuxtLink
          v-for="tag in sortedTags"
          :key="tag.slug"
          :to="`${config.basePath}/${tag.slug}`"
        >
          <UCard class="hover:scale-105 transition-transform cursor-pointer">
            <div class="text-center">
              <h3 class="font-semibold text-lg mb-1">
                {{ tag.name }}
              </h3>
              <p class="text-sm text-muted mb-2">
                {{ tag.count }} article{{ tag.count === 1 ? "" : "s" }}
              </p>
              <p
                v-if="tag.description"
                class="text-xs text-muted line-clamp-2"
              >
                {{ tag.description }}
              </p>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <div
        v-else
        class="text-center py-12"
      >
        <p class="text-muted">
          No tags found
        </p>
      </div>
    </UPageSection>
  </UPage>
</template>
