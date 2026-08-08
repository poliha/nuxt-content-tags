<script setup lang="ts">
import type { Tag } from '../../types'
import { useRuntimeConfig } from '#imports'

export interface Props {
  tag: Tag
  variant?: 'subtle' | 'solid' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  to?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'subtle',
  size: 'md',
})

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

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

const variantClasses = {
  subtle: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  solid: 'bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900',
  outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
}
</script>

<template>
  <NuxtLink
    :to="to || resolveTagPath(tag.slug)"
    class="inline-flex items-center rounded-md font-medium cursor-pointer hover:scale-105 transition-transform"
    :class="[sizeClasses[size!], variantClasses[variant!]]"
  >
    {{ tag.name }}
  </NuxtLink>
</template>
