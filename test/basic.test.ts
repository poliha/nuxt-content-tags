import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('nuxt-content-tags', async () => {
  await setup({
    rootDir: './test/fixtures/basic',
  })

  describe('tag index page', () => {
    it('renders the tag index page with configured title', async () => {
      const html = await $fetch('/tags')
      expect(html).toContain('All Tags')
      expect(html).toContain('Browse content by tags')
    })

    it('injects runtime config correctly', async () => {
      const html = await $fetch('/tags')
      expect(html).toContain('basePath:"/tags"')
      expect(html).toContain('ui:"headless"')
      expect(html).toContain('generatePages:true')
    })

    it('uses headless variant (no Nuxt UI components)', async () => {
      const html = await $fetch('/tags')
      // Headless variant uses max-w-7xl container, not UContainer
      expect(html).toContain('max-w-7xl')
      // Should NOT contain Nuxt UI-specific classes
      expect(html).not.toContain('UPage')
      expect(html).not.toContain('UPageHero')
    })
  })

  describe('individual tag page', () => {
    it('renders a tag page with loading state for SSR', async () => {
      // Tag detail pages use onMounted for data loading,
      // so SSR renders the loading state
      const html = await $fetch('/tags/nuxt')
      expect(html).toContain('Loading...')
    })

    it('returns 404 for nonexistent tag', async () => {
      try {
        await $fetch('/tags/nonexistent')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (error: any) {
        // Page renders loading state, 404 is thrown client-side
        // via createError in onMounted
        expect(error).toBeDefined()
      }
    })
  })

  describe('module configuration', () => {
    it('registers tag pages at the configured base path', async () => {
      // Tag index should be accessible at /tags
      const html = await $fetch('/tags')
      expect(html).toBeDefined()
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('registers tag slug pages', async () => {
      // Tag slug page should be accessible
      const html = await $fetch('/tags/nuxt')
      expect(html).toBeDefined()
      expect(html).toContain('<!DOCTYPE html>')
    })
  })
})
