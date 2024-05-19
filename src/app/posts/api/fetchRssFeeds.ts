import { fetchHatenaPosts } from "@/app/posts/api/fetchHatenaPosts";
import { fetchNotePosts } from "@/app/posts/api/fetchNotePosts";
import { fetchQiitaPosts } from "@/app/posts/api/fetchQiitaPosts";
import { fetchZennPosts } from "@/app/posts/api/fetchZennPosts";

export async function fetchRssFeeds() {
  const [hatenaPosts, notePosts, qiitaPosts, zennPosts] = await Promise.all([
    fetchHatenaPosts(),
    fetchNotePosts(),
    fetchQiitaPosts(),
    fetchZennPosts(),
  ]);

  return { hatenaPosts, notePosts, qiitaPosts, zennPosts };
}
