import type { ModuleOptions } from '../src/module'

export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/content', '@nuxt/ui'],

  // @ts-expect-error - Module types not yet augmented in playground
  contentTags: {
    enabled: true,
    basePath: '/tags',
    generatePages: true,
  } as ModuleOptions,

  content: {
    sources: {
      content: {
        driver: 'fs',
        base: './content',
      },
    },
  },

  devtools: { enabled: true },

  compatibilityDate: '2024-11-01',
})
