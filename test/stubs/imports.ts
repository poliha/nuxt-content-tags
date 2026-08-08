/**
 * Stands in for Nuxt's `#imports` alias when unit tests import runtime code
 * directly, outside a Nuxt build. Integration tests run through a real Nuxt
 * server and resolve the real alias instead.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Collections = (name: string) => { all: () => Promise<any[]> }

let collections: Collections = () => ({ all: async () => [] })

export function setCollections(impl: Collections) {
  collections = impl
}

export function resetCollections() {
  collections = () => ({ all: async () => [] })
}

export const queryCollection: Collections = name => collections(name)
