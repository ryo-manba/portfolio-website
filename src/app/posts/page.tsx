import { Metadata } from "next";
import { fetchRssFeeds } from "@/app/posts/api/fetchRssFeeds";
import { getBlogPosts } from "@/app/blog/utils/getBlogPosts";
import { BlogSearchAndTabs } from "./components/BlogSearchAndTabs";
import type { Post } from "@/app/posts/types";

export const revalidate = 86400; // revalidate this page every　1 day

const pageTitle = "Posts";
const title = "ブログ記事一覧 - ryo-manba";
const description = "note、Qiita、Zenn、はてなブログ、個人ブログで投稿した記事を一覧で掲載しています。";

export const metadata: Metadata = {
  title: pageTitle,
  openGraph: {
    title,
    description,
    url: "/posts",
  },
  twitter: {
    title,
    description,
  },
};

const Posts = async () => {
  const { zennPosts, notePosts, hatenaPosts, qiitaPosts } = await fetchRssFeeds();

  const blogPosts: Post[] = getBlogPosts().map((post) => ({
    name: "Blog",
    domain: "ryo-manba.me",
    favicon: "/icon1.png",
    title: post.title,
    url: `/blog/${post.slug}`,
    createdAt: post.date,
  }));

  const isError = [...hatenaPosts, ...notePosts, ...qiitaPosts, ...zennPosts, ...blogPosts].length === 0;

  return (
    <>
      {isError ? (
        <p className="text-center text-xl font-semibold">
          投稿が取得できませんでした。
          <br />
          時間を置いてから、もう一度ご覧ください。
        </p>
      ) : (
        <BlogSearchAndTabs
          zennPosts={zennPosts}
          notePosts={notePosts}
          hatenaPosts={hatenaPosts}
          qiitaPosts={qiitaPosts}
          blogPosts={blogPosts}
        />
      )}
    </>
  );
};

export default Posts;
