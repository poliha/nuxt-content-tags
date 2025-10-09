<script setup lang="ts">
import type { Tag } from "../types";

export interface Props {
  tag: Tag;
  variant?: "subtle" | "solid" | "outline";
  size?: "sm" | "md" | "lg";
  to?: string;
}

withDefaults(defineProps<Props>(), {
  variant: "subtle",
  size: "md",
});

const runtimeConfig = useRuntimeConfig();
const moduleConfig = runtimeConfig.public.contentTags as
  | {
      basePath?: string;
    }
  | undefined;
const basePath = moduleConfig?.basePath || "/tags";

function resolveTagPath(slug: string) {
  if (basePath === "/") {
    return `/${slug}`;
  }

  return `${basePath}/${slug}`;
}
</script>

<template>
  <UBadge
    :color="tag.color || 'neutral'"
    :variant="variant"
    :size="size"
    :to="to || resolveTagPath(tag.slug)"
    class="cursor-pointer hover:scale-105 transition-transform"
  >
    {{ tag.name }}
  </UBadge>
</template>
