<script setup lang="ts">
import type { Tag, TagWithCount } from '../types'

export interface Props {
  tags: Tag[] | TagWithCount[]
  layout?: 'horizontal' | 'vertical'
  showCount?: boolean
}

withDefaults(defineProps<Props>(), {
  layout: 'horizontal',
  showCount: false,
})

function isTagWithCount(tag: Tag | TagWithCount): tag is TagWithCount {
  return 'count' in tag
}

const runtimeConfig = useRuntimeConfig()
const moduleConfig = runtimeConfig.public.contentTags as
  | {
    basePath?: string
  }
  | undefined
const basePath = moduleConfig?.basePath || '/tags'

function resolveTagPath(slug: string) {
  if (basePath === '/') {
    return `/${slug}`
  }

  return `${basePath}/${slug}`
}
</script>

<template>
  <div
    :class="{
      'flex gap-2 flex-wrap': layout === 'horizontal',
      'flex flex-col gap-2': layout === 'vertical',
    }"
  >
    <NuxtLink
      v-for="tag in tags"
      :key="tag.slug"
      :to="resolveTagPath(tag.slug)"
    >
      <UBadge
        :color="tag.color || 'neutral'"
        variant="subtle"
        size="md"
        class="cursor-pointer hover:scale-105 transition-transform"
      >
        {{ tag.name }}
        <span
          v-if="showCount && isTagWithCount(tag)"
          class="ml-1 opacity-70"
        >
          ({{ tag.count }})
        </span>
      </UBadge>
    </NuxtLink>
  </div>
</template>
