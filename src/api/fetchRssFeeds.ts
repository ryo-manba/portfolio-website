import type { Post } from '@/types/post';
import { fetchHatenaPosts } from '@/api/fetchHatenaPosts';
import { fetchNotePosts } from '@/api/fetchNotePosts';
import { fetchQiitaPosts } from '@/api/fetchQiitaPosts';

export async function fetchRssFeeds(): Promise<Post[]> {
  const [hatenaPosts, notePosts, qiitaPosts] = await Promise.all([
    fetchHatenaPosts(),
    fetchNotePosts(),
    fetchQiitaPosts(),
  ]);

  // 新しい順に並び替える
  const allPosts = [...hatenaPosts, ...notePosts, ...qiitaPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return allPosts;
}
