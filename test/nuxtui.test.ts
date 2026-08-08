import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

// Covers the `ui: 'nuxtui'` variant against a real @nuxt/ui install.
// The headless variant is covered in basic.test.ts.
describe('nuxt-content-tags (nuxt ui variant)', async () => {
  await setup({
    rootDir: './test/fixtures/nuxtui',
  })

  it('resolves the nuxtui variant from config', async () => {
    const html = await $fetch('/tags')
    expect(html).toContain('ui:"nuxtui"')
  })

  it('renders the tag index through Nuxt UI components', async () => {
    const html = await $fetch('/tags')
    // UContainer renders a max-w-(--ui-container) wrapper, not the
    // headless variant's max-w-7xl
    expect(html).toContain('--ui-container')
    expect(html).not.toContain('max-w-7xl')
  })

  it('renders tag data server-side', async () => {
    const html = await $fetch('/tags')
    expect(html).not.toContain('Loading tags...')
    expect(html).toContain('Nuxt')
    expect(html).toContain('2 articles')
  })

  it('renders a tag detail page server-side', async () => {
    const html = (await $fetch('/tags/nuxt')) as string
    expect(html).not.toContain('Loading...')
    expect(html).toContain('Nuxt framework articles')
    expect(html).toContain('Test Article')
    expect(html).toContain('Second Article')
    expect(html.indexOf('Second Article')).toBeLessThan(
      html.indexOf('Test Article'),
    )
  })

  it('returns a 404 status for a nonexistent tag', async () => {
    await expect($fetch('/tags/nonexistent')).rejects.toMatchObject({
      statusCode: 404,
    })
  })
})
