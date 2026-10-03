import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { registerUndefinedTagCheck } from '../src/build/register-tag-check'

type HookFn = (...args: never[]) => unknown

/**
 * The collector is covered in undefined-tags.test.ts. What is covered here is
 * the wiring around it: reading the content folders from disk and reporting
 * from a build hook. An earlier version fed the index from Nuxt Content's
 * parse hook, which fires only for files its cache re-parses, so a warm build
 * misreported. Reading the files is what makes every build see every file.
 */
function fakeNuxt() {
  const hooks = new Map<string, HookFn[]>()
  return {
    hooks,
    hook: (name: string, fn: HookFn) => {
      hooks.set(name, [...(hooks.get(name) || []), fn])
    },
    async call(name: string) {
      for (const fn of hooks.get(name) || []) {
        await (fn as () => unknown)()
      }
    },
  }
}

let rootDir: string

beforeEach(async () => {
  rootDir = await mkdtemp(join(tmpdir(), 'content-tags-'))
})

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true })
})

async function write(path: string, body: string) {
  const full = join(rootDir, 'content', path)
  await mkdir(join(full, '..'), { recursive: true })
  await writeFile(full, body)
}

function article(tags: string[]) {
  return `---\ntitle: "A"\ntags:\n${tags.map(t => `  - ${t}`).join('\n')}\n---\n\nBody.\n`
}

function register(nuxt: ReturnType<typeof fakeNuxt>, warn: (m: string) => void) {
  registerUndefinedTagCheck(nuxt, {
    rootDir,
    articlesCollection: 'articles',
    tagsCollection: 'tags',
    warn,
  })
}

describe('undefined tag check wiring', () => {
  it('subscribes to a build hook', () => {
    const nuxt = fakeNuxt()
    register(nuxt, () => {})
    expect([...nuxt.hooks.keys()]).toContain('build:done')
  })

  it('warns for a slug no tag definition declares, naming the article', async () => {
    const warn = vi.fn()
    const nuxt = fakeNuxt()
    register(nuxt, warn)

    await write('tags/nuxt.yml', 'name: Nuxt\nslug: nuxt\n')
    await write('articles/a.md', article(['nuxt', 'ghost']))
    await nuxt.call('build:done')

    expect(warn).toHaveBeenCalledTimes(1)
    const message = String(warn.mock.calls[0]?.[0])
    expect(message).toContain('"ghost" referenced by articles/a.md')
    expect(message).not.toContain('"nuxt"')
  })

  it('sees every definition, not only the files changed since the last build', async () => {
    // The warm-cache case that misreported: a new article using two tags
    // whose definitions sit in separate files.
    const warn = vi.fn()
    const nuxt = fakeNuxt()
    register(nuxt, warn)

    await write('tags/nuxt.yml', 'name: Nuxt\nslug: nuxt\n')
    await write('tags/vue.yml', 'name: Vue\nslug: vue\n')
    await write('articles/new.md', article(['vue', 'nuxt']))
    await nuxt.call('build:done')

    expect(warn).not.toHaveBeenCalled()
  })

  it('reads inline tag lists and quoted values', async () => {
    const warn = vi.fn()
    const nuxt = fakeNuxt()
    register(nuxt, warn)

    await write('tags/nuxt.yml', 'name: "Nuxt"\nslug: "nuxt" # the framework\n')
    await write('articles/a.md', '---\ntitle: A\ntags: [nuxt, "ghost"]\n---\n')
    await nuxt.call('build:done')

    const message = String(warn.mock.calls[0]?.[0])
    expect(message).toContain('"ghost"')
    expect(message).not.toContain('"nuxt"')
  })

  it('reports once even though two build hooks are subscribed', async () => {
    const warn = vi.fn()
    const nuxt = fakeNuxt()
    register(nuxt, warn)

    await write('tags/nuxt.yml', 'slug: nuxt\n')
    await write('articles/a.md', article(['ghost']))
    await nuxt.call('nitro:build:before')
    await nuxt.call('build:done')

    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('stays silent when the content folders are missing', async () => {
    const warn = vi.fn()
    const nuxt = fakeNuxt()
    register(nuxt, warn)

    await nuxt.call('build:done')

    expect(warn).not.toHaveBeenCalled()
  })

  it('skips files it cannot parse, and articles without frontmatter', async () => {
    const warn = vi.fn()
    const nuxt = fakeNuxt()
    register(nuxt, warn)

    await write('tags/nuxt.yml', 'slug: nuxt\n')
    await write('tags/broken.yml', 'slug: [unclosed\n')
    await write('articles/plain.md', '# No frontmatter\n')
    await write('articles/a.md', article(['nuxt']))
    await nuxt.call('build:done')

    expect(warn).not.toHaveBeenCalled()
  })
})
