import { fetchHatenaPosts } from "@/app/posts/api/fetchHatenaPosts";
import { fetchNotePosts } from "@/app/posts/api/fetchNotePosts";
import { fetchQiitaPosts } from "@/app/posts/api/fetchQiitaPosts";
import { fetchZennPosts } from "@/app/posts/api/fetchZennPosts";
import type { Post } from "@/app/posts/types";

export async function fetchRssFeeds(): Promise<Post[]> {
  const [hatenaPosts, notePosts, qiitaPosts, zennPosts] = await Promise.all([
    fetchHatenaPosts(),
    fetchNotePosts(),
    fetchQiitaPosts(),
    fetchZennPosts(),
  ]);

  // 新しい順に並び替える
  const allPosts = [...hatenaPosts, ...notePosts, ...qiitaPosts, ...zennPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return allPosts;
}
