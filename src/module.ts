import {
  defineNuxtModule,
  addComponent,
  createResolver,
  addImportsDir,
  addTypeTemplate,
} from "@nuxt/kit";

function normalizeBasePath(basePath: string | undefined) {
  if (!basePath) {
    return "/tags";
  }

  let normalized = basePath.trim();
  if (!normalized) {
    return "/tags";
  }

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  normalized = normalized.replace(/\/+$/g, "");

  return normalized || "/";
}

function withTrailingSlash(path: string) {
  if (!path || path === "/") {
    return path;
  }

  return `${path}/`;
}

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
      nuxt: ">=3.0.0",
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
    const basePath = normalizeBasePath(options.basePath);
    const slugPath = basePath === "/" ? "/:slug" : `${basePath}/:slug`;

    // Ensure runtime config is initialised and updated with final options
    options.basePath = basePath;
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {};
    nuxt.options.runtimeConfig.public.contentTags = {
      ...(nuxt.options.runtimeConfig.public.contentTags || {}),
      ...options,
      basePath,
    };

    // Add type declarations for runtime config
    addTypeTemplate({
      filename: "types/nuxt-content-tags.d.ts",
      getContents: () => `
declare module '@nuxt/schema' {
  interface RuntimeConfig {
    public: {
      contentTags: {
        enabled: boolean
        generatePages: boolean
        basePath: string
        autoDetect: boolean
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
    });

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

    if (options.generatePages) {
      nuxt.hook("pages:extend", (pages) => {
        const indexPage = {
          name: "content-tags",
          path: basePath,
          file: resolver.resolve("./runtime/pages/tags/index.vue"),
        } as {
          name: string;
          path: string;
          file: string;
          alias?: string[];
        };

        if (basePath !== "/") {
          indexPage.alias = [withTrailingSlash(basePath)];
        }

        const tagPage = {
          name: "content-tags-slug",
          path: slugPath,
          file: resolver.resolve("./runtime/pages/tags/[slug].vue"),
        } as {
          name: string;
          path: string;
          file: string;
          alias?: string[];
        };

        tagPage.alias =
          basePath === "/"
            ? ["/:slug/"]
            : [`${withTrailingSlash(basePath)}:slug/`];

        if (!pages.find((page) => page.file === indexPage.file)) {
          pages.push(indexPage);
        }

        if (!pages.find((page) => page.file === tagPage.file)) {
          pages.push(tagPage);
        }
      });
    }
  },
});
