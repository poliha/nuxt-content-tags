<script setup lang="ts">
import { useTags } from "../../composables/useTags";
import type { Tag } from "../../types";

const route = useRoute();
const tagSlug = route.params.slug as string;

const { getTag, getArticlesByTag, getRelatedTags } = useTags();

const tag = ref<Tag | null>(null);
const articles = ref<any[]>([]);
const relatedTags = ref<Tag[]>([]);
const loading = ref(true);

// Get module config
const config = useRuntimeConfig().public.contentTags;

onMounted(async () => {
  try {
    // Load tag metadata
    tag.value = await getTag(tagSlug);

    if (!tag.value) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tag not found",
        fatal: true,
      });
    }

    // Load articles with this tag
    const allArticles = await getArticlesByTag(tagSlug);
    // Sort by date (newest first)
    articles.value = allArticles.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Load related tags if enabled
    if (config.pages?.tag?.showRelated) {
      const limit = config.pages?.tag?.relatedLimit || 5;
      relatedTags.value = await getRelatedTags(tagSlug, limit);
    }
  } finally {
    loading.value = false;
  }
});

// SEO
watchEffect(() => {
  if (!tag.value) return;

  const titleTemplate = config.pages?.tag?.titleTemplate || "%s - Tags";
  const title = titleTemplate.replace("%s", tag.value.name);

  useSeoMeta({
    title,
    description:
      tag.value.description || `Articles tagged with ${tag.value.name}`,
    ogTitle: title,
    ogDescription:
      tag.value.description || `Articles tagged with ${tag.value.name}`,
  });
});
</script>

<template>
  <UPage v-if="tag && !loading">
    <UPageHero
      :title="tag.name"
      :description="tag.description"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
      }"
    >
      <template #footer>
        <div class="flex items-center gap-2 text-sm text-muted">
          <ULink :to="config.basePath" class="hover:text-primary">
            All tags
          </ULink>
          <span>•</span>
          <span>
            {{ articles.length }} article{{ articles.length === 1 ? "" : "s" }}
          </span>
        </div>
      </template>
    </UPageHero>

    <UPageSection
      :ui="{
        container: '!pt-0',
      }"
    >
      <!-- Related Tags -->
      <div v-if="relatedTags.length > 0" class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Related Tags</h3>
        <div class="flex gap-2 flex-wrap">
          <UBadge :to="config.basePath" color="primary" variant="outline">
            All tags
          </UBadge>
          <UBadge
            v-for="relatedTag in relatedTags"
            :key="relatedTag.slug"
            :to="`${config.basePath}/${relatedTag.slug}`"
            :color="relatedTag.color || 'neutral'"
            variant="subtle"
            class="cursor-pointer hover:scale-105 transition-transform"
          >
            {{ relatedTag.name }}
          </UBadge>
        </div>
      </div>

      <!-- Articles -->
      <div v-if="articles.length > 0">
        <h3 class="text-lg font-semibold mb-4">Articles</h3>
        <div class="space-y-4">
          <NuxtLink
            v-for="article in articles"
            :key="article.path"
            :to="article.path"
            class="block p-4 rounded-lg border border-default hover:border-primary transition-colors"
          >
            <h4 class="font-semibold mb-1">{{ article.title }}</h4>
            <p v-if="article.description" class="text-sm text-muted">
              {{ article.description }}
            </p>
          </NuxtLink>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-muted">No articles found with this tag</p>
        <UButton :to="config.basePath" variant="link" class="mt-4">
          View all tags
        </UButton>
      </div>
    </UPageSection>
  </UPage>

  <div v-else-if="loading" class="text-center py-12">
    <p class="text-muted">Loading...</p>
  </div>
</template>
