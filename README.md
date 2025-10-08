# Nuxt Content Tags

> Zero-config WordPress-like tagging module for Nuxt Content

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

## ✨ Features

- 🎯 **Zero-config** - Works out of the box with sensible defaults
- 🏷️ **WordPress-like** - Familiar tagging experience for WordPress migrators
- 📄 **Auto-generated pages** - Tag index and individual tag pages created automatically
- 🔗 **Related tags** - Smart co-occurrence analysis for content discovery
- 🎨 **Nuxt UI ready** - Beautiful components with Nuxt UI integration
- 🚀 **SEO optimized** - Proper meta tags and structured data
- 📱 **Responsive** - Mobile-first design out of the box
- ⚡ **Performance** - Optimized for fast builds and runtime
- 🔧 **TypeScript** - Full type safety and IntelliSense support

## 🎬 Quick Setup

1. Add `nuxt-content-tags` dependency to your project

```bash
# Using pnpm
pnpm add -D nuxt-content-tags

# Using yarn
yarn add --dev nuxt-content-tags

# Using npm
npm install --save-dev nuxt-content-tags
```

2. Add `nuxt-content-tags` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    'nuxt-content-tags'
  ]
})
```

That's it! The module will auto-detect tags in your content and generate tag pages at `/tags` 🎉

## 📖 Documentation

### Content Structure

Create individual tag files in `/content/tags/`:

```yaml
# content/tags/nuxt.yml
name: 'Nuxt'
slug: 'nuxt'
description: 'Articles about the Nuxt framework'
color: 'green'
```

Then reference tags in your articles:

```yaml
---
title: 'My Article'
tags:
  - nuxt
  - typescript
---
```

### Configuration

While zero-config is the goal, you can customize the module:

```js
export default defineNuxtConfig({
  modules: ['nuxt-content-tags'],
  contentTags: {
    // Enable/disable the module
    enabled: true,
    
    // Generate tag pages automatically
    generatePages: true,
    
    // Base path for tag pages
    basePath: '/tags',
    
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

### Components

Use the provided components in your pages:

```vue
<template>
  <div>
    <!-- Display a single tag -->
    <TagBadge :tag="tag" variant="subtle" size="md" />
    
    <!-- Display multiple tags -->
    <TagList :tags="tags" layout="horizontal" :show-count="true" />
  </div>
</template>
```

### Composables

Use the `useTags` composable to access tag data:

```vue
<script setup>
const { tags, getTag, getArticlesByTag, getRelatedTags } = useTags()

// Get all tags
const allTags = await tags.value

// Get a specific tag
const nuxtTag = await getTag('nuxt')

// Get articles with a tag
const nuxtArticles = await getArticlesByTag('nuxt')

// Get related tags
const related = await getRelatedTags('nuxt', 5)
</script>
```

## 🛣️ Roadmap

### v1.0 (Current)
- ✅ Core tag utilities
- ✅ Basic components (TagBadge, TagList)
- ✅ Auto-generated tag pages
- ✅ Related tags functionality
- ✅ SEO optimization
- ✅ Nuxt UI integration

### v1.1 (Planned)
- [ ] TagCloud component
- [ ] Advanced visualization options
- [ ] Theme customization

### v1.2 (Future)
- [ ] TagFilter component
- [ ] Analytics integration
- [ ] Multi-tag filtering

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

[MIT License](./LICENSE)

## 🙏 Credits

Built with ❤️ by [Peter Oliha](https://oliha.dev)

Inspired by WordPress tagging system and the needs of content creators migrating to Nuxt.

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-content-tags/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-content-tags

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-content-tags.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-content-tags

[license-src]: https://img.shields.io/npm/l/nuxt-content-tags.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-content-tags

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com

---

## 💬 Feedback Wanted!

This is a new module and we'd love to hear from you:

- What features would you like to see?
- What problems are you facing with tags in Nuxt Content?
- How can we make this better?

Please open an issue or discussion on GitHub!
