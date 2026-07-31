import { readJson, writeJson } from './storage';

const STORAGE_KEY = 'blog_post_views';

type ViewCounts = Record<string, number>;

export function incrementPostView(postId: string): number {
  const counts = readJson<ViewCounts>(STORAGE_KEY, {});
  counts[postId] = (counts[postId] || 0) + 1;
  writeJson(STORAGE_KEY, counts);
  return counts[postId];
}

export function getPostViewCount(postId: string): number {
  return readJson<ViewCounts>(STORAGE_KEY, {})[postId] || 0;
}