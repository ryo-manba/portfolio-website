import type { NextPageWithLayout } from '@/types/NextPageWithLayout';
import { TitleLayout } from '@/components/Layout/TitleLayout';
import { BlogList } from '@/components/BlogList';
import { useTitle } from '@/hooks/useTitle';
import { Meta } from '@/components/Meta';

const PAGE_TITLE = 'Posts';

const Posts: NextPageWithLayout = () => {
  useTitle(PAGE_TITLE);
  return (
    <>
      <Meta
        title="ブログ記事一覧 - ryo-manba"
        description="note、Qiita、はてなブログで投稿した記事を一覧で掲載しています。"
      />
      <BlogList />
    </>
  );
};

Posts.getLayout = (page) => {
  return <TitleLayout title="Posts">{page}</TitleLayout>;
};

export default Posts;
