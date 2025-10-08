import {
  defineNuxtModule,
  addComponent,
  createResolver,
  addImportsDir,
} from "@nuxt/kit";

export interface ModuleOptions {
  /**
   * Enable/disable the module
   * @default true
   */
  enabled?: boolean;

  /**
   * Generate tag pages automatically
   * @default true
   */
  generatePages?: boolean;

  /**
   * Base path for tag pages
   * @default '/tags'
   */
  basePath?: string;

  /**
   * Auto-detect tags from content
   * @default true
   */
  autoDetect?: boolean;

  /**
   * Page configuration
   */
  pages?: {
    index?: {
      title?: string;
      description?: string;
    };
    tag?: {
      titleTemplate?: string;
      showRelated?: boolean;
      relatedLimit?: number;
    };
  };

  /**
   * SEO options
   */
  seo?: {
    enabled?: boolean;
    structuredData?: boolean;
  };
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-content-tags",
    configKey: "contentTags",
    compatibility: {
      nuxt: "^3.0.0",
    },
  },
  defaults: {
    enabled: true,
    generatePages: true,
    basePath: "/tags",
    autoDetect: true,
    pages: {
      index: {
        title: "All Tags",
        description: "Browse content by tags",
      },
      tag: {
        titleTemplate: "%s - Tags",
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
      return;
    }

    const resolver = createResolver(import.meta.url);

    // Add runtime directory
    nuxt.options.build.transpile.push(resolver.resolve("./runtime"));

    // Auto-import composables
    addImportsDir(resolver.resolve("./runtime/composables"));

    // Auto-import components
    await addComponent({
      name: "TagBadge",
      filePath: resolver.resolve("./runtime/components/TagBadge.vue"),
    });

    await addComponent({
      name: "TagList",
      filePath: resolver.resolve("./runtime/components/TagList.vue"),
    });

    // Add module options to runtime config
    nuxt.options.runtimeConfig.public.contentTags = options;

    // TODO: Add page generation logic in next iteration
    if (options.generatePages) {
      // Will add pages via Nuxt hooks
    }
  },
});
