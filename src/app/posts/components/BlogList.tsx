"use client";

import { BlogCard } from "@/app/posts/components/BlogCard";
import type { Post } from "@/app/posts/types";
import { memo, useState } from "react";
import { Pagination } from "@/components/Pagination";

const POSTS_PER_PAGE = 10;

type Props = {
  posts: Post[];
};

export const BlogList = memo(function BlogList({ posts }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
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
              key={post.url}
              siteName={post.domain}
              logoUrl={post.favicon}
              title={post.title}
              link={post.url}
              createdAt={post.createdAt.slice(0, 10)}
            />
          ))}
        </div>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </>
  );
});
