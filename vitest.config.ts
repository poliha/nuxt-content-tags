import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // Unit tests import runtime code directly, with no Nuxt build to resolve
      // the real alias. Integration tests are unaffected: they run against a
      // real Nuxt server that resolves #imports itself.
      '#imports': fileURLToPath(
        new URL('./test/stubs/imports.ts', import.meta.url),
      ),
    },
  },
})
