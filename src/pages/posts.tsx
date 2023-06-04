import { GetStaticProps } from 'next';
import type { NextPageWithLayout } from '@/types/NextPageWithLayout';
import { TitleLayout } from '@/components/Layout/TitleLayout';
import { BlogList } from '@/components/BlogList';
import { useTitle } from '@/hooks/useTitle';
import { fetchRssFeeds } from '@/api/fetchRssFeeds';
import { Meta } from '@/components/Meta';
import type { Post } from '@/types/post';

const PAGE_TITLE = 'Posts';
const ERROR_MESSAGE =
  '投稿が取得できませんでした。時間を置いてから、もう一度ご覧ください。';
const revalidate = 60 * 60 * 24; // 1 day in seconds

export const getStaticProps: GetStaticProps = async () => {
  const posts = await fetchRssFeeds();
  const error = posts.length === 0 ? ERROR_MESSAGE : null;

  return {
    props: {
      posts,
      error,
    },
    revalidate,
  };
};

type Props = {
  posts: Post[];
  error: string | null;
};

const Posts: NextPageWithLayout<Props> = ({ posts, error }) => {
  useTitle(PAGE_TITLE);

  return (
    <>
      <Meta
        title="ブログ記事一覧 - ryo-manba"
        description="note、Qiita、Zenn、はてなブログで投稿した記事を一覧で掲載しています。"
      />
      {error ? (
        <p className="text-center text-xl font-semibold">{error}</p>
      ) : (
        <BlogList posts={posts} />
      )}
    </>
  );
};

Posts.getLayout = (page) => {
  return <TitleLayout title="Posts">{page}</TitleLayout>;
};

export default Posts;
