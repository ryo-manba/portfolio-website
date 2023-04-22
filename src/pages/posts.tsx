import { BlogCard } from '../components/BlogCard/BlogCard';
import { useHatena } from '../hooks/useHatena';
import { useNote } from '../hooks/useNote';

const BlogList = () => {
  const {
    posts: postsNote,
    error: errorNote,
    isLoading: isLoadingNote,
  } = useNote(1);
  const {
    posts: postsHatena,
    error: errorHatena,
    isLoading: isLoadingHatena,
  } = useHatena();

  if (errorNote || errorHatena) {
    return <div>Error has occurred.</div>;
  }
  if (isLoadingNote || isLoadingHatena) {
    return <div className="text-center text-3xl font-bold">isLoading...</div>;
  }

  const p = [...postsNote, ...postsHatena];
  const posts = p.sort((a, b) => {
    if (a.createdAt > b.createdAt) {
      return -1;
    } else if (a.createdAt < b.createdAt) {
      return 1;
    } else {
      return 0;
    }
  });

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
