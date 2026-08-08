export default defineNuxtConfig({
  modules: ['../../../src/module', '@nuxt/content'],

  contentTags: {
    enabled: true,
    basePath: '/tags',
    generatePages: true,
    ui: 'headless',
  },

  compatibilityDate: '2025-07-01',
})
