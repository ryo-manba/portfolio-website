import { BlogCard } from '../components/BlogCard/BlogCard';
import { useHatena } from '../hooks/useHatena';
import { useNote } from '../hooks/useNote';
import { useQiita } from '../hooks/useQiita';

const BlogList = () => {
  const {
    posts: postsNote,
    error: errorNote,
    isLoading: isLoadingNote,
  } = useNote(1);
  const {
    posts: postsHatena,
    error: errorHatena,
    isLoading: isLoadingHatenaNote,
  } = useHatena();
  const {
    posts: postsQiita,
    error: errorQiita,
    isLoading: isLoadingQiita,
  } = useQiita();

  if (errorNote || errorHatena || errorQiita) {
    return <div>Error has occurred.</div>;
  }
  if (isLoadingNote || isLoadingHatenaNote || isLoadingQiita) {
    return <div className="text-center text-3xl font-bold">isLoading...</div>;
  }

  const posts = [...postsNote, ...postsHatena, ...postsQiita].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

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
      <h1 className="text-center text-4xl font-bold mb-8">Posts</h1>
      <div className="flex justify-center mx-44"></div>
      <BlogList />
      <div></div>
    </div>
  );
};

export default Posts;
