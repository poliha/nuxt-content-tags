export interface Tag {
  name: string
  slug: string
  description?: string
  color?: string
}

export interface TagWithCount extends Tag {
  count: number
}

export interface Article {
  path: string
  title: string
  description?: string
  date?: Date
  tags?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
