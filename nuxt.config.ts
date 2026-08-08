// Root config for `nuxi prepare .` only (see the dev:prepare script). It exists
// so the prepared type stubs include @nuxt/content's auto-imports, which the
// runtime code imports from '#imports'. The published module is built by
// nuxt-module-build and never reads this file.
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  compatibilityDate: '2025-07-01',
})
