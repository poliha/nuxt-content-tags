export default defineNuxtConfig({
  modules: ["../src/module", "@nuxt/content", "@nuxt/ui"],

  contentTags: {
    enabled: true,
    basePath: "/tags",
    generatePages: true,
  },

  content: {
    sources: {
      content: {
        driver: "fs",
        base: "./content",
      },
    },
  },

  devtools: { enabled: true },

  compatibilityDate: "2024-11-01",
});
