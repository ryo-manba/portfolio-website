import { BlogList } from '../components/BlogList/BlogList';

const Posts = () => {
  return (
    <div className="my-12">
      <h1 className="text-center text-4xl font-bold mb-8">Posts</h1>
      <div className="flex justify-center mx-44"></div>
      <BlogList />
      <div></div>
    </div>
  );
};

export default Posts;
