import { Metadata } from "next";
import { fetchRssFeeds } from "@/app/posts/api/fetchRssFeeds";
import { BlogSearchAndTabs } from "./components/BlogSearchAndTabs";

export const revalidate = 86400; // revalidate this page every　1 day

const pageTitle = "Posts";
const title = "ブログ記事一覧 - ryo-manba";
const description = "note、Qiita、Zenn、はてなブログで投稿した記事を一覧で掲載しています。";

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
  const isError = [...hatenaPosts, ...notePosts, ...qiitaPosts, ...zennPosts].length === 0;

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
        />
      )}
    </>
  );
};

export default Posts;
