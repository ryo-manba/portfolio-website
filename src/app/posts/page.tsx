import { fetchRssFeeds } from "@/app/posts/api/fetchRssFeeds";
import { BlogList } from "@/app/posts/components/BlogList";
import { PageTitle } from "@/components/page-title";
import { Metadata } from "next";

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
  const posts = await fetchRssFeeds();
  const isError = posts.length === 0;

  return (
    <>
      <PageTitle title={pageTitle} />
      {isError ? (
        <p className="text-center text-xl font-semibold">
          投稿が取得できませんでした。
          <br />
          時間を置いてから、もう一度ご覧ください。
        </p>
      ) : (
        <BlogList posts={posts} />
      )}
    </>
  );
};

export default Posts;
