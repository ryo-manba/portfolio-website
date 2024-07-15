"use client";
import { useState } from "react";
import { BlogTabs } from "@/app/posts/components/BlogTabs";
import type { Post } from "@/app/posts/types";
import { FaSearch } from "react-icons/fa";

const filterPosts = (posts: Post[], query: string) => {
  return posts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()));
};

export type BlogSearchAndTabsProps = {
  zennPosts: Post[];
  notePosts: Post[];
  hatenaPosts: Post[];
  qiitaPosts: Post[];
};

export const BlogSearchAndTabs = ({ zennPosts, notePosts, hatenaPosts, qiitaPosts }: BlogSearchAndTabsProps) => {
  const [query, setQuery] = useState("");

  return (
    <search className="flex flex-col items-center w-full">
      <div className="flex flex-col w-full justify-center mb-4 items-center">
        <label htmlFor="search" className="mb-2 text-lg font-semibold text-gray-700">
          記事を探す
        </label>
        <div className="relative w-3/4 md:w-[800px]">
          <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
          <input
            id="search"
            type="search"
            placeholder="記事のタイトルで検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-2 pl-10 border border-gray-300 rounded w-full outline-offset-2"
            aria-describedby="search-instruction"
          />
        </div>
        <p id="search-instruction" className="sr-only">
          入力するごとに記事が絞り込まれます
        </p>
      </div>
      <BlogTabs
        zennPosts={filterPosts(zennPosts, query)}
        notePosts={filterPosts(notePosts, query)}
        hatenaPosts={filterPosts(hatenaPosts, query)}
        qiitaPosts={filterPosts(qiitaPosts, query)}
      />
    </search>
  );
};
