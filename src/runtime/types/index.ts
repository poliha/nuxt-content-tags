export interface Tag {
  name: string
  slug: string
  description?: string
  color?: string
}

export interface TagWithCount extends Tag {
  count: number
}

/**
 * Predicate deciding which articles a tag query should consider.
 *
 * Useful when the surrounding site only publishes a subset of a collection,
 * e.g. holding back future-dated posts in production.
 */
export type ArticleFilter = (article: Article) => boolean

export interface Article {
  path: string
  title: string
  description?: string
  date?: Date
  tags?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
