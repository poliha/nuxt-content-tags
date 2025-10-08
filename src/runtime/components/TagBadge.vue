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
</script>

<template>
  <UBadge
    :color="tag.color || 'neutral'"
    :variant="variant"
    :size="size"
    :to="to || `/tags/${tag.slug}`"
    class="cursor-pointer hover:scale-105 transition-transform"
  >
    {{ tag.name }}
  </UBadge>
</template>
