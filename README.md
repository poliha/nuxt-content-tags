# Nuxt Content Tags

> Zero-config WordPress-like tagging module for Nuxt Content

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

## Features

- **Zero-config** -- Works out of the box with sensible defaults
- **WordPress-like** -- Familiar tagging experience for WordPress migrators
- **Auto-generated pages** -- Tag index and individual tag pages created automatically
- **Related tags** -- Smart co-occurrence analysis for content discovery
- **Headless or Nuxt UI** -- Auto-detects Nuxt UI, falls back to plain HTML + Tailwind
- **SEO optimized** -- Proper meta tags and structured data
- **Nuxt 3 + 4** -- Compatible with both major versions
- **TypeScript** -- Full type safety and IntelliSense support

## Requirements

- Nuxt `>=3.0.0`
- `@nuxt/content` `>=3.6.0`
- `@nuxt/ui` `>=3.0.0` (optional -- enhanced styling when present)

## Quick Setup

### 1. Install the module

```bash
pnpm add -D nuxt-content-tags
```

### 2. Add to your Nuxt config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    'nuxt-content-tags'
  ]
})
```

### 3. Define your content collections

This is the critical step. You need `tags` and `articles` collections in your `content.config.ts`:

```ts
// content.config.ts
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      type: 'page',
      source: 'articles/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.date().optional(),
        tags: z.array(z.string()).optional(),
      }),
    }),
    tags: defineCollection({
      type: 'data',
      source: 'tags/*.yml',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        color: z.string().optional(),
      }),
    }),
  },
})
```

### 4. Add content

Create tag files:

```yaml
# content/tags/nuxt.yml
name: "Nuxt"
slug: "nuxt"
description: "Articles about the Nuxt framework"
color: "green"
```

Reference tags in articles:

```yaml
---
title: "My Article"
tags:
  - nuxt
  - typescript
---
```

That's it! Tag pages are auto-generated at `/tags`.

## Configuration

```ts
export default defineNuxtConfig({
  modules: ['nuxt-content-tags'],
  contentTags: {
    // Enable/disable the module
    enabled: true,

    // Generate tag pages automatically
    generatePages: true,

    // Base path for tag pages
    basePath: '/tags',

    // UI variant: 'auto' | 'headless' | 'nuxtui'
    // 'auto' detects @nuxt/ui and uses it if present
    ui: 'auto',

    // Page configuration
    pages: {
      index: {
        title: 'All Tags',
        description: 'Browse content by tags'
      },
      tag: {
        titleTemplate: '%s - Tags',
        showRelated: true,
        relatedLimit: 5
      }
    },

    // SEO options
    seo: {
      enabled: true,
      structuredData: true
    }
  }
})
```

### UI Option

The module auto-detects whether `@nuxt/ui` is installed:

- **With Nuxt UI**: Uses `UContainer`, `UCard`, `UBadge`, `UButton`, `ULink` components
- **Without Nuxt UI**: Uses plain HTML with Tailwind CSS utility classes

You can force a specific variant:

```ts
contentTags: {
  ui: 'headless' // Always use plain HTML + Tailwind
}
```

## Components

### TagBadge

Display a single tag as a badge with a link.

```vue
<template>
  <TagBadge :tag="tag" variant="subtle" size="md" />
</template>
```

**Props:**
- `tag: Tag` -- Tag object with `name`, `slug`, optional `color`
- `variant?: 'subtle' | 'solid' | 'outline'` -- Badge style (default: `'subtle'`)
- `size?: 'sm' | 'md' | 'lg'` -- Badge size (default: `'md'`)
- `to?: string` -- Override the default tag page link

### TagList

Display multiple tags in a row or column.

```vue
<template>
  <TagList :tags="tags" layout="horizontal" :show-count="true" />
</template>
```

**Props:**
- `tags: Tag[] | TagWithCount[]` -- Array of tags
- `layout?: 'horizontal' | 'vertical'` -- Layout direction (default: `'horizontal'`)
- `showCount?: boolean` -- Show article count (default: `false`)

## Composables

### useTags

```vue
<script setup>
const {
  tags,           // Ref<TagWithCount[]> - all tags with counts
  loading,        // Ref<boolean>
  error,          // Ref<Error | null>
  getTag,         // (slug: string) => Promise<Tag | null>
  getTagsByArticle, // (article: Article) => Promise<Tag[]>
  getArticlesByTag, // (tagSlug: string) => Promise<Article[]>
  getRelatedTags, // (tagSlug: string, limit?) => Promise<Tag[]>
  refresh,        // () => Promise<void>
} = useTags()
</script>
```

Tags are fetched with `useAsyncData`, so they render during SSR and arrive in the
payload rather than being refetched on hydration. Call `useTags` from a setup
context, as with any Nuxt data composable.

#### Limiting which articles count

If your site only publishes part of a collection -- drafts hidden, future-dated
posts held back until their date -- pass a `filter` so tag pages and counts match
the rest of the site:

```vue
<script setup>
const config = useRuntimeConfig()

const { tags } = useTags('articles', {
  filter: (article) => {
    if (config.public.siteEnv !== 'production') return true
    return !article.date || new Date(article.date) <= new Date()
  },
})
</script>
```

The filter applies to every query the composable makes, so counts, tag listings,
and related tags all agree. The underlying utilities take it as a trailing
argument too: `getArticlesByTag(slug, collection, filter)`.

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm dev:prepare

# Start playground
pnpm dev

# Run tests
pnpm test

# Lint
pnpm lint

# Build for publishing
pnpm prepack
```

## License

[MIT License](./LICENSE)

Built by [Peter Oliha](https://oliha.dev)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-content-tags/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-content-tags

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-content-tags.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-content-tags

[license-src]: https://img.shields.io/npm/l/nuxt-content-tags.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-content-tags

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
