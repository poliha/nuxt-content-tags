<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const { tags } = useTags()
</script>

<template>
  <UContainer>
    <div class="py-12">
      <h1 class="text-3xl font-bold mb-4">
        nuxt-content-tags playground
      </h1>
      <p class="text-lg text-(--ui-text-muted) mb-8">
        A zero-config tagging module for Nuxt Content.
      </p>

      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">
          Inline TagList component
        </h2>
        <TagList
          :tags="tags"
          :show-count="true"
          layout="horizontal"
        />
      </div>

      <div>
        <UButton
          to="/tags"
          variant="solid"
          color="primary"
        >
          Browse all tags
        </UButton>
      </div>
    </div>
  </UContainer>
</template>
