import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, it, expect, vi } from 'vitest'
import {
  CONTENT_PARSE_HOOK,
  registerUndefinedTagCheck,
} from '../src/build/register-tag-check'

type HookFn = (...args: never[]) => unknown

/**
 * The collector is covered in undefined-tags.test.ts. What is covered here is
 * the wiring around it, which depends on two things this repo does not own:
 * the name of Nuxt Content's parse hook, and the shape of the context it
 * passes. Both were verified by hand in a playground build, which no CI run
 * repeats, so a rename upstream would disable the check and leave the suite
 * green. That is the failure this module already shipped once.
 */
function fakeNuxt() {
  const hooks = new Map<string, HookFn[]>()
  return {
    hooks,
    hook: (name: string, fn: HookFn) => {
      hooks.set(name, [...(hooks.get(name) || []), fn])
    },
    async call(name: string, arg?: unknown) {
      for (const fn of hooks.get(name) || []) {
        await (fn as (a?: unknown) => unknown)(arg)
      }
    },
  }
}

function register(nuxt: ReturnType<typeof fakeNuxt>, warn: (m: string) => void) {
  registerUndefinedTagCheck(nuxt, {
    articlesCollection: 'articles',
    tagsCollection: 'tags',
    warn,
  })
}

// The context @nuxt/content passes: { file, content, collection }.
const tagFile = {
  file: { id: 'tags/tags/nuxt.yml' },
  content: { slug: 'nuxt' },
  collection: { name: 'tags' },
}

function articleFile(tags: string[], id = 'articles/articles/a.md') {
  return { file: { id }, content: { tags }, collection: { name: 'articles' } }
}

describe('undefined tag check wiring', () => {
  it('names a hook that the installed @nuxt/content actually calls', async () => {
    // Pins the contract to the dependency. An upstream rename fails here rather
    // than silently disabling the check.
    // Read the file directly: @nuxt/content does not export this subpath.
    const source = await readFile(
      fileURLToPath(
        new URL('../node_modules/@nuxt/content/dist/module.mjs', import.meta.url),
      ),
      'utf8',
    )
    expect(source).toContain(`"${CONTENT_PARSE_HOOK}"`)
  })

  it('subscribes to the parse hook and to a build hook', () => {
    const nuxt = fakeNuxt()
    register(nuxt, () => {})
    expect([...nuxt.hooks.keys()]).toContain(CONTENT_PARSE_HOOK)
    expect([...nuxt.hooks.keys()]).toContain('build:done')
  })

  it('warns for a slug no tag definition declares, naming the article', async () => {
    const warn = vi.fn()
    const nuxt = fakeNuxt()
    register(nuxt, warn)

    await nuxt.call(CONTENT_PARSE_HOOK, tagFile)
    await nuxt.call(CONTENT_PARSE_HOOK, articleFile(['nuxt', 'ghost']))
    await nuxt.call('build:done')

    expect(warn).toHaveBeenCalledTimes(1)
    const message = String(warn.mock.calls[0]?.[0])
    expect(message).toContain('"ghost"')
    expect(message).toContain('articles/a.md')
    expect(message).not.toContain('"nuxt"')
  })

  it('stays silent when every referenced slug is defined', async () => {
    const warn = vi.fn()
    const nuxt = fakeNuxt()
    register(nuxt, warn)

    await nuxt.call(CONTENT_PARSE_HOOK, tagFile)
    await nuxt.call(CONTENT_PARSE_HOOK, articleFile(['nuxt']))
    await nuxt.call('nitro:build:before')
    await nuxt.call('build:done')

    expect(warn).not.toHaveBeenCalled()
  })

  it('reports once even though two build hooks are subscribed', async () => {
    const warn = vi.fn()
    const nuxt = fakeNuxt()
    register(nuxt, warn)

    await nuxt.call(CONTENT_PARSE_HOOK, tagFile)
    await nuxt.call(CONTENT_PARSE_HOOK, articleFile(['ghost']))
    await nuxt.call('nitro:build:before')
    await nuxt.call('build:done')

    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('ignores a parse context carrying no collection', async () => {
    const warn = vi.fn()
    const nuxt = fakeNuxt()
    register(nuxt, warn)

    await nuxt.call(CONTENT_PARSE_HOOK, { content: { tags: ['ghost'] } })
    await nuxt.call('build:done')

    expect(warn).not.toHaveBeenCalled()
  })
})
