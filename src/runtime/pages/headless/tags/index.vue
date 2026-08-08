<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from 'vue'
import { useTags } from '../../../composables/useTags'
import type { ModuleOptions } from '../../../../module'
import { useRuntimeConfig, useSeoMeta } from '#imports'

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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {{ config.pages?.index?.title || 'Tags' }}
      </h1>
      <p
        v-if="config.pages?.index?.description"
        class="mt-2 text-lg text-gray-600 dark:text-gray-400"
      >
        {{ config.pages?.index?.description }}
      </p>
    </div>

    <div
      v-if="loading"
      class="text-center py-12"
    >
      <p class="text-gray-500 dark:text-gray-400">
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
        class="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 transition-all cursor-pointer bg-white dark:bg-gray-900"
      >
        <div class="text-center">
          <h3 class="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
            {{ tag.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {{ tag.count }} article{{ tag.count === 1 ? '' : 's' }}
          </p>
          <p
            v-if="tag.description"
            class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2"
          >
            {{ tag.description }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <div
      v-else
      class="text-center py-12"
    >
      <p class="text-gray-500 dark:text-gray-400">
        No tags found
      </p>
    </div>
  </div>
</template>
