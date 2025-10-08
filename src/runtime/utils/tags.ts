import type { Tag, TagWithCount, Article } from "../types";

/**
 * Get all unique tags from content with their metadata
 */
export async function getAllTags(): Promise<Tag[]> {
  const tagsCollection = await queryCollection("tags").all();
  return tagsCollection || [];
}

/**
 * Get tag metadata by slug
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const tags = await getAllTags();
  return tags.find((tag) => tag.slug === slug) || null;
}

/**
 * Get all articles that have a specific tag
 */
export async function getArticlesByTag(
  tagSlug: string,
  collectionName: string = "articles"
): Promise<Article[]> {
  const articles = await queryCollection(collectionName).all();
  return articles.filter(
    (article: Article) =>
      article.tags && article.tags.some((tag: string) => tag === tagSlug)
  );
}

/**
 * Get tags with article count
 */
export async function getTagsWithCount(
  collectionName: string = "articles"
): Promise<TagWithCount[]> {
  const [tags, articles] = await Promise.all([
    getAllTags(),
    queryCollection(collectionName).all(),
  ]);

  const tagCountMap = new Map<string, number>();

  // Count articles per tag
  articles.forEach((article: Article) => {
    if (article.tags) {
      article.tags.forEach((tagSlug: string) => {
        tagCountMap.set(tagSlug, (tagCountMap.get(tagSlug) || 0) + 1);
      });
    }
  });

  // Combine tags with counts
  return tags
    .map((tag) => ({
      ...tag,
      count: tagCountMap.get(tag.slug) || 0,
    }))
    .filter((tag) => tag.count > 0); // Only return tags that are actually used
}

/**
 * Get related tags based on co-occurrence with a given tag
 */
export async function getRelatedTags(
  tagSlug: string,
  limit: number = 5,
  collectionName: string = "articles"
): Promise<Tag[]> {
  const articles = await getArticlesByTag(tagSlug, collectionName);
  const relatedTagSlugs = new Map<string, number>();

  // Count co-occurring tags
  articles.forEach((article: Article) => {
    if (article.tags) {
      article.tags.forEach((slug: string) => {
        if (slug !== tagSlug) {
          relatedTagSlugs.set(slug, (relatedTagSlugs.get(slug) || 0) + 1);
        }
      });
    }
  });

  // Sort by frequency and get top tags
  const sortedSlugs = Array.from(relatedTagSlugs.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([slug]) => slug);

  // Get tag metadata
  const allTags = await getAllTags();
  return sortedSlugs
    .map((slug) => allTags.find((tag) => tag.slug === slug))
    .filter((tag): tag is Tag => tag !== undefined);
}

/**
 * Get a consistent color for a tag
 */
export function getTagColor(tag: Tag): string {
  return tag.color || "gray";
}

/**
 * Format tag slug for display if no name is available
 */
export function formatTagName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
