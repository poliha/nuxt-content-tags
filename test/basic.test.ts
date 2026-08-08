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

    it('renders tag data server-side, not a loading state', async () => {
      const html = await $fetch('/tags')
      expect(html).not.toContain('Loading tags...')
      expect(html).toContain('Nuxt')
      expect(html).toContain('Testing')
      // nuxt tag has 2 articles, testing has 1
      expect(html).toContain('2 articles')
      expect(html).toContain('1 article')
    })
  })

  describe('individual tag page', () => {
    it('renders tag metadata server-side', async () => {
      const html = await $fetch('/tags/nuxt')
      expect(html).not.toContain('Loading...')
      expect(html).toContain('Nuxt framework articles')
    })

    it('renders tagged articles server-side, newest first', async () => {
      const html = (await $fetch('/tags/nuxt')) as string
      expect(html).toContain('Test Article')
      expect(html).toContain('Second Article')
      // Second Article (2025-11-01) is newer than Test Article (2025-10-01)
      expect(html.indexOf('Second Article')).toBeLessThan(
        html.indexOf('Test Article'),
      )
    })

    it('renders related tags server-side', async () => {
      // Both tags appear on test-article.md, so testing is related to nuxt
      const html = await $fetch('/tags/nuxt')
      expect(html).toContain('Related Tags')
      expect(html).toContain('/tags/testing')
    })

    it('sets the tag title in SSR head', async () => {
      const html = await $fetch('/tags/nuxt')
      expect(html).toContain('<title>Nuxt - Tags</title>')
    })

    it('returns a 404 status for a nonexistent tag', async () => {
      await expect($fetch('/tags/nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      })
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
