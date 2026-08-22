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
- **Server-rendered** -- Tag pages render on the server with titles and meta
  descriptions set, so crawlers see real content
- **Undefined tags reported** -- The build names any tag slug an article
  references that no tag definition declares
- **Nuxt 3 + 4** -- Compatible with both major versions
- **TypeScript** -- Full type safety and IntelliSense support

## Requirements

- Nuxt `>=3.0.0`
- `@nuxt/content` `>=3.6.0`
- `@nuxt/ui` `>=3.0.0` (optional -- enhanced styling when present)

If you are adding `@nuxt/content` for the first time, it also needs `better-sqlite3`
to query content locally, and will stop the build with
`Nuxt Content requires better-sqlite3 module to operate` until it is installed:

```bash
pnpm add -D better-sqlite3
```

It compiles a native binding, so pnpm may need permission to run its build script
(`pnpm approve-builds`, or list it under `pnpm.onlyBuiltDependencies`). This is a
`@nuxt/content` requirement rather than one of this module's, but it lands during
setup, so it is worth knowing up front.

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

This is the critical step, and the names matter more than you might expect.

- **`tags`** holds the tag definitions. This name is required.
- **`articles`** holds the content being tagged. The generated pages look for this
  name specifically. If your collection is called something else, see
  [Using a different collection name](#using-a-different-collection-name).

Add both to your `content.config.ts`:

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

### Using a different collection name

The composable and utilities take the collection name as their first argument, so
any name works when you render tags yourself:

```vue
<script setup>
const { tags } = useTags('posts')
</script>
```

The **generated pages** are a different story: they call `useTags()` with no
argument, so they always read a collection named `articles`. If your content lives
under another name and you want tag pages, set `generatePages: false` and build
your own using the composable.

Making this configurable is tracked in
[issue #6](https://github.com/poliha/nuxt-content-tags/issues/6).

## Configuration

All options live under the `contentTags` key and all are optional. The defaults are
what you get from the setup above.

| Option | Type | Default | What it does |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Set `false` to turn the module off entirely. Nothing is registered. |
| `generatePages` | `boolean` | `true` | Registers the tag index and tag detail routes. Set `false` to keep the components and composable but own the routes yourself. |
| `basePath` | `string` | `'/tags'` | Where tag pages live. Leading slash optional, trailing slashes stripped. `'/'` mounts them at the root. |
| `ui` | `'auto' \| 'headless' \| 'nuxtui'` | `'auto'` | Which component set to use. `'auto'` uses Nuxt UI when it is installed and plain markup otherwise. |
| `autoDetect` | `boolean` | `true` | Reserved for auto-detecting tags from content. Not yet used. |
| `pages.index.title` | `string` | `'All Tags'` | Heading and document title on the tag index. |
| `pages.index.description` | `string` | `'Browse content by tags'` | Sub-heading and meta description on the tag index. |
| `pages.tag.titleTemplate` | `string` | `'%s - Tags'` | Title for a tag page. `%s` is replaced with the tag name. |
| `pages.tag.showRelated` | `boolean` | `true` | Show tags that co-occur with the current one. |
| `pages.tag.relatedLimit` | `number` | `5` | How many related tags to show. |
| `seo.enabled` | `boolean` | `true` | Reserved for SEO output. Page titles and meta descriptions are set regardless. |
| `seo.structuredData` | `boolean` | `true` | Reserved for JSON-LD output. Not yet emitted. |

<details>
<summary>Full config example</summary>

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/content', 'nuxt-content-tags'],
  contentTags: {
    enabled: true,
    generatePages: true,
    basePath: '/tags',
    ui: 'auto',
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
    seo: {
      enabled: true,
      structuredData: true
    }
  }
})
```

</details>

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

| Prop | Type | Default | Description |
|---|---|---|---|
| `tag` | `Tag` | required | Tag object with `name`, `slug`, and optional `color` |
| `variant` | `'subtle' \| 'solid' \| 'outline'` | `'subtle'` | Badge style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Badge size |
| `to` | `string` | tag page | Override the link target |

### TagList

Display multiple tags in a row or column.

```vue
<template>
  <TagList :tags="tags" layout="horizontal" :show-count="true" />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `tags` | `Tag[] \| TagWithCount[]` | required | Tags to render |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `showCount` | `boolean` | `false` | Show article counts. Needs `TagWithCount[]` |

## Composables

### useTags

```ts
useTags(collection?: string, options?: { filter?: (article: Article) => boolean })
```

| Argument | Type | Default | Description |
|---|---|---|---|
| `collection` | `string` | `'articles'` | Which content collection to count and list |
| `options.filter` | `(article: Article) => boolean` | none | Restrict which articles count. See below |

Returns:

| Key | Type | Description |
|---|---|---|
| `tags` | `Ref<TagWithCount[]>` | Tags that have at least one article, with counts |
| `loading` | `Ref<boolean>` | True while the underlying request is in flight |
| `error` | `Ref<Error \| null>` | Error from the tag query, if any |
| `getAllTags` | `() => Promise<Tag[]>` | Every defined tag, including unused ones, unfiltered |
| `getTag` | `(slug: string) => Promise<Tag \| null>` | One tag by slug |
| `getTagsByArticle` | `(article: Article) => Promise<Tag[]>` | Resolve an article's slugs to tag objects |
| `getArticlesByTag` | `(slug: string, collection?: string) => Promise<Article[]>` | Articles carrying a tag |
| `getRelatedTags` | `(slug: string, limit?: number, collection?: string) => Promise<Tag[]>` | Tags that co-occur with this one, most frequent first |
| `refresh` | `() => Promise<void>` | Refetch the tag list |

`tags` is fetched with `useAsyncData`, so it resolves during SSR and arrives in the
payload rather than being refetched on hydration. Call `useTags` from a setup
context, as with any Nuxt data composable.

Note that `tags` omits tags with no articles, while `getAllTags` returns every
defined tag. Use `getAllTags` when mapping an article's slugs to names, so tags
that are only used by filtered-out articles still resolve.

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

## Undefined tags

Article frontmatter can reference a tag slug that has no entry in the `tags`
collection. At runtime that fails quietly: the lookup returns nothing, the tag
renders nowhere, and it has no tag page.

The module compares the two as content is parsed and warns once at the end of
the build:

```
WARN  [nuxt-content-tags] 2 tag slugs are referenced by articles but not defined in the tags collection.
  - "another-missing" referenced by articles/getting-started.md
  - "ghost-tag" referenced by articles/getting-started.md
  These render nowhere and have no tag page. Add a definition, or remove the reference.
```

It is a warning and never fails the build. It reports only when the tags
collection was parsed in the same run, so a cached content build cannot
mistakenly name every slug in the site.

In development the check runs on the initial build. Content edits after that
re-parse through Nuxt Content's own hot-reload path, which does not fire the
build hooks, so restart the dev server to re-check.

## Contributing

Issues and pull requests are welcome. [Open issues](https://github.com/poliha/nuxt-content-tags/issues)
are the best place to see what is planned or to say what you need.

### Getting set up

```bash
git clone https://github.com/poliha/nuxt-content-tags.git
cd nuxt-content-tags
pnpm install
pnpm dev:prepare   # generate type stubs
pnpm dev           # start the playground
```

### Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Playground at `localhost:3000`, tag pages at `/tags` |
| `pnpm dev:prepare` | Regenerate type stubs. Run after changing module options |
| `pnpm test` | Unit and integration tests |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm test:types` | Typecheck with `vue-tsc` |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm prepack` | Build `dist/` as it will be published |

### Before opening a pull request

Run `pnpm lint`, `pnpm test`, and `pnpm test:types`. CI runs all three plus a build,
and the test job runs against both Nuxt 3 and Nuxt 4.

Commits follow [conventional commits](https://www.conventionalcommits.org)
(`feat:`, `fix:`, `docs:`, `chore:`), since the changelog is generated from them.

### One thing worth knowing

**Nuxt does not inject auto-imports into `node_modules`.** Code under
`src/runtime/` must import everything explicitly from `#imports`:

```ts
import { queryCollection, useAsyncData } from '#imports'
```

A bare `queryCollection` works in this repo's fixtures, because they load the module
from source, and then fails silently once the module is installed from npm. The
test suite cannot catch it ([issue #2](https://github.com/poliha/nuxt-content-tags/issues/2)).
If you touch runtime code, verify against a real install:

```bash
pnpm pack
cd /some/scratch/nuxt-app && pnpm add /path/to/nuxt-content-tags-x.y.z.tgz
```

### Testing against the playground

The playground needs `better-sqlite3`, which `@nuxt/content` requires for local
content queries. It is already a dev dependency here, but it needs a native build,
so allow the build script if pnpm blocks it:

```bash
pnpm approve-builds
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
