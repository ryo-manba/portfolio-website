import { BlogCard } from '../components/BlogCard/BlogCard';
import { useNote } from '../hooks/useNote';

const BlogList = () => {
  const { posts, error, isLoading } = useNote(1);
  if (error) {
    return <div>Error has occurred.</div>;
  }
  if (isLoading) {
    return <div className="text-center text-3xl font-bold">isLoading...</div>;
  }

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 gap-6">
        {posts.map((data, index) => (
          <BlogCard
            key={index}
            siteName={data.domain}
            logoUrl={data.favicon}
            title={data.title}
            link={data.url}
            createdAt={data.createdAt.slice(0, 10)}
          />
        ))}
      </div>
    </div>
  );
};

const Posts = () => {
  return (
    <div className="my-12">
      <h1 className="text-center text-4xl font-bold mb-5">Posts</h1>
      <div className="flex justify-center my-8 mx-44"></div>
      <BlogList />
      <div></div>
    </div>
  );
};

export default Posts;
