import {
  defineNuxtModule,
  addComponent,
  createResolver,
  addImportsDir,
  addTypeTemplate,
  hasNuxtModule,
} from '@nuxt/kit'
import { registerUndefinedTagCheck, type HookTarget } from './build/register-tag-check'

function normalizeBasePath(basePath: string | undefined) {
  if (!basePath) {
    return '/tags'
  }

  let normalized = basePath.trim()
  if (!normalized) {
    return '/tags'
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }

  normalized = normalized.replace(/\/+$/g, '')

  return normalized || '/'
}

function withTrailingSlash(path: string) {
  if (!path || path === '/') {
    return path
  }

  return `${path}/`
}

export type {
  Tag,
  TagWithCount,
  Article,
  ArticleFilter,
} from './runtime/types'

export interface ModuleOptions {
  /**
   * Enable/disable the module
   * @default true
   */
  enabled?: boolean

  /**
   * Generate tag pages automatically
   * @default true
   */
  generatePages?: boolean

  /**
   * Base path for tag pages
   * @default '/tags'
   */
  basePath?: string

  /**
   * Auto-detect tags from content
   * @default true
   */
  autoDetect?: boolean

  /**
   * UI variant to use for components and pages
   * - 'auto': detect @nuxt/ui presence (default)
   * - 'headless': plain HTML + Tailwind
   * - 'nuxtui': Nuxt UI components
   * @default 'auto'
   */
  ui?: 'auto' | 'headless' | 'nuxtui'

  /**
   * Page configuration
   */
  pages?: {
    index?: {
      title?: string
      description?: string
    }
    tag?: {
      titleTemplate?: string
      showRelated?: boolean
      relatedLimit?: number
    }
  }

  /**
   * SEO options
   */
  seo?: {
    enabled?: boolean
    structuredData?: boolean
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-content-tags',
    configKey: 'contentTags',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    enabled: true,
    generatePages: true,
    basePath: '/tags',
    autoDetect: true,
    ui: 'auto',
    pages: {
      index: {
        title: 'All Tags',
        description: 'Browse content by tags',
      },
      tag: {
        titleTemplate: '%s - Tags',
        showRelated: true,
        relatedLimit: 5,
      },
    },
    seo: {
      enabled: true,
      structuredData: true,
    },
  },
  async setup(options, nuxt) {
    if (!options.enabled) {
      return
    }

    const resolver = createResolver(import.meta.url)
    const basePath = normalizeBasePath(options.basePath)
    const slugPath = basePath === '/' ? '/:slug' : `${basePath}/:slug`

    // Resolve UI variant
    let uiVariant: 'headless' | 'nuxtui'
    if (options.ui === 'nuxtui') {
      uiVariant = 'nuxtui'
    }
    else if (options.ui === 'headless') {
      uiVariant = 'headless'
    }
    else {
      // auto-detect
      uiVariant = hasNuxtModule('@nuxt/ui', nuxt) ? 'nuxtui' : 'headless'
    }

    // Ensure runtime config is initialised and updated with final options
    options.basePath = basePath
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
    nuxt.options.runtimeConfig.public.contentTags = {
      ...(nuxt.options.runtimeConfig.public.contentTags || {}),
      ...options,
      basePath,
    }

    // Add type declarations for runtime config
    addTypeTemplate({
      filename: 'types/nuxt-content-tags.d.ts',
      getContents: () => `
declare module '@nuxt/schema' {
  interface RuntimeConfig {
    public: {
      contentTags: {
        enabled: boolean
        generatePages: boolean
        basePath: string
        autoDetect: boolean
        ui: 'auto' | 'headless' | 'nuxtui'
        pages?: {
          index?: {
            title?: string
            description?: string
          }
          tag?: {
            titleTemplate?: string
            showRelated?: boolean
            relatedLimit?: number
          }
        }
        seo?: {
          enabled?: boolean
          structuredData?: boolean
        }
      }
    }
  }
}

export {}
`,
    })

    // Add runtime directory
    nuxt.options.build.transpile.push(resolver.resolve('./runtime'))

    // Auto-import composables
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Auto-import components from the resolved UI variant
    await addComponent({
      name: 'TagBadge',
      filePath: resolver.resolve(
        `./runtime/components/${uiVariant}/TagBadge.vue`,
      ),
    })

    await addComponent({
      name: 'TagList',
      filePath: resolver.resolve(
        `./runtime/components/${uiVariant}/TagList.vue`,
      ),
    })

    // Both collection names are fixed today. When they become configurable
    // they thread through here, and the check follows without further change.
    // Nuxt types `hook` against a closed union of its own hook names, which
    // cannot express a hook another module owns.
    registerUndefinedTagCheck(nuxt as unknown as HookTarget, {
      articlesCollection: 'articles',
      tagsCollection: 'tags',
    })

    if (options.generatePages) {
      nuxt.hook('pages:extend', (pages) => {
        const indexPage = {
          name: 'content-tags',
          path: basePath,
          file: resolver.resolve(
            `./runtime/pages/${uiVariant}/tags/index.vue`,
          ),
        } as {
          name: string
          path: string
          file: string
          alias?: string[]
        }

        if (basePath !== '/') {
          indexPage.alias = [withTrailingSlash(basePath)]
        }

        const tagPage = {
          name: 'content-tags-slug',
          path: slugPath,
          file: resolver.resolve(
            `./runtime/pages/${uiVariant}/tags/[slug].vue`,
          ),
        } as {
          name: string
          path: string
          file: string
          alias?: string[]
        }

        tagPage.alias
          = basePath === '/'
            ? ['/:slug/']
            : [`${withTrailingSlash(basePath)}:slug/`]

        if (!pages.find(page => page.file === indexPage.file)) {
          pages.push(indexPage)
        }

        if (!pages.find(page => page.file === tagPage.file)) {
          pages.push(tagPage)
        }
      })
    }
  },
})
