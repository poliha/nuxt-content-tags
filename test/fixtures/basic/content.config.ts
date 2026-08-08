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
