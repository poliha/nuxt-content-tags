// Ambient type declarations for runtime utilities that depend on @nuxt/content
// These are only available when @nuxt/content is installed (which is a peer dependency)

/**
 * Query collection composable from @nuxt/content
 * This is auto-imported by Nuxt Content in the consuming application
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function queryCollection(collectionName: string): any;
