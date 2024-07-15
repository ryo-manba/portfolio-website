"use client";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import type { TabPanelProps, TabProps } from "react-aria-components";
import type { Post } from "@/app/posts/types";

import { BlogList } from "@/app/posts/components/BlogList";

export type BlogTabProps = {
  zennPosts: Post[];
  notePosts: Post[];
  hatenaPosts: Post[];
  qiitaPosts: Post[];
};

export const BlogTabs = ({ zennPosts, notePosts, hatenaPosts, qiitaPosts }: BlogTabProps) => {
  const allPosts = [...hatenaPosts, ...notePosts, ...qiitaPosts, ...zennPosts].sort(
    (a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const tabsData = [
    { id: "all", label: "All Posts", posts: allPosts },
    { id: "zenn", label: "Zenn", posts: zennPosts },
    { id: "note", label: "note", posts: notePosts },
    { id: "hatena", label: "Hatena", posts: hatenaPosts },
    { id: "qiita", label: "Qiita", posts: qiitaPosts },
  ];

  const noPostsFound = allPosts.length === 0;

  return (
    <Tabs className="md:w-[800px] w-full mb-4">
      <TabList
        aria-label="Blog Posts"
        className="flex space-x-1 rounded-full bg-[#F1F1F1] bg-clip-padding p-1 border border-solid border-white/30"
      >
        {tabsData.map((tab) => (
          <MyTab key={tab.id} id={tab.id}>
            {tab.label} ({tab.posts.length})
          </MyTab>
        ))}
      </TabList>
      {tabsData.map((tab) => (
        <MyTabPanel key={tab.id} id={tab.id}>
          <BlogList posts={tab.posts} />
        </MyTabPanel>
      ))}
      <div aria-live="assertive" aria-atomic="true">
        {noPostsFound && <p className="sr-only">記事が見つかりませんでした。</p>}
      </div>
    </Tabs>
  );
};

function MyTab(props: TabProps) {
  return (
    <Tab
      {...props}
      className={({ isSelected }) => `
        w-full rounded-full py-2.5 font-medium text-[1.1em] text-center cursor-default outline-offset-2 transition-colors
        ${
          isSelected
            ? "text-white bg-blue-500 shadow"
            : "text-gray-600 bg-gray-200 hover:bg-gray-300 pressed:bg-gray-300"
        }
      `}
    />
  );
}

function MyTabPanel(props: TabPanelProps) {
  return (
    <TabPanel
      {...props}
      className="mt-2 text-gray-700 rounded-2xl p-2 shadow ring-black outline-none focus-visible:ring-2"
    />
  );
}
