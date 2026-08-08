export default defineNuxtConfig({
  modules: ['../../../src/module', '@nuxt/content', '@nuxt/ui'],

  contentTags: {
    enabled: true,
    basePath: '/tags',
    generatePages: true,
    ui: 'nuxtui',
  },

  compatibilityDate: '2025-07-01',
})
