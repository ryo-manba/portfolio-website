import type { NextPageWithLayout } from '@/types/NextPageWithLayout';
import { TitleLayout } from '@/components/Layout/TitleLayout';
import { BlogList } from '@/components/BlogList';
import { useTitle } from '@/hooks/useTitle';

const PAGE_TITLE = 'Posts';

const Posts: NextPageWithLayout = () => {
  useTitle(PAGE_TITLE);
  return <BlogList />;
};

Posts.getLayout = (page) => {
  return <TitleLayout title="Posts">{page}</TitleLayout>;
};

export default Posts;
