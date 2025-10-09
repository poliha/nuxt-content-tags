import type { ModuleOptions } from '../src/module'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    contentTags?: ModuleOptions
  }
  interface NuxtOptions {
    contentTags?: ModuleOptions
  }
}

export {}
