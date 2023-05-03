import { useState, memo } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { BlogCard } from '@/components/BlogCard';

const POSTS_PER_PAGE = 10;

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
};

const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handleClick = (pageNumber: number) => {
    onPageChange(pageNumber);
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <button
        className={`${
          currentPage === 1
            ? 'hidden'
            : 'mx-1 w-8 h-8 rounded-full border border-gray-400 bg-white'
        }`}
        onClick={handlePrevClick}
      >
        {'<'}
      </button>
      <ul className="flex items-center">
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1;
          const isActive = pageNumber === currentPage;
          return (
            <li key={index} className="mx-1">
              <button
                className={`w-8 h-8 rounded-full border border-gray-400 ${
                  isActive ? 'bg-gray-900 text-white' : 'bg-white'
                }`}
                onClick={() => handleClick(pageNumber)}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        className={`${
          currentPage === totalPages
            ? 'hidden'
            : 'mx-1 w-8 h-8 rounded-full border border-gray-400 bg-white'
        }`}
        onClick={handleNextClick}
      >
        {'>'}
      </button>
    </div>
  );
});

export const BlogList = memo(function BlogList() {
  const { posts, error, isLoading } = usePosts();

  const [currentPage, setCurrentPage] = useState(1);

  if (error) {
    return <div>Error has occurred.</div>;
  }
  if (isLoading) {
    return <div className="text-center text-3xl font-bold">isLoading...</div>;
  }
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentPosts.map((post, index) => (
            <BlogCard
              key={index}
              siteName={post.domain}
              logoUrl={post.favicon}
              title={post.title}
              link={post.url}
              createdAt={post.createdAt.slice(0, 10)}
            />
          ))}
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
});
