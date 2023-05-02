import type { NextPageWithLayout } from '../types/NextPageWithLayout';
import { TitleLayout } from '../components/Layout/TitleLayout';
import { BlogList } from '../components/BlogList/BlogList';

const Posts: NextPageWithLayout = () => {
  return <BlogList />;
};

Posts.getLayout = (page) => {
  return <TitleLayout title="Posts">{page}</TitleLayout>;
};

export default Posts;
