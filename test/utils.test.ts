import { describe, it, expect } from 'vitest'
import { formatTagName, getTagColor } from '../src/runtime/utils/tags'

describe('formatTagName', () => {
  it('capitalizes a single word', () => {
    expect(formatTagName('nuxt')).toBe('Nuxt')
  })

  it('capitalizes each word in a hyphenated slug', () => {
    expect(formatTagName('nuxt-framework')).toBe('Nuxt Framework')
  })

  it('handles single character words', () => {
    expect(formatTagName('a-b-c')).toBe('A B C')
  })

  it('handles already capitalized input', () => {
    expect(formatTagName('Vue')).toBe('Vue')
  })

  it('handles empty string', () => {
    expect(formatTagName('')).toBe('')
  })

  it('handles multi-word slugs', () => {
    expect(formatTagName('server-side-rendering')).toBe('Server Side Rendering')
  })
})

describe('getTagColor', () => {
  it('returns the tag color when set', () => {
    expect(getTagColor({ name: 'Nuxt', slug: 'nuxt', color: 'green' })).toBe('green')
  })

  it('returns gray as the default when no color set', () => {
    expect(getTagColor({ name: 'Nuxt', slug: 'nuxt' })).toBe('gray')
  })

  it('returns gray for empty color string', () => {
    expect(getTagColor({ name: 'Nuxt', slug: 'nuxt', color: '' })).toBe('gray')
  })
})
