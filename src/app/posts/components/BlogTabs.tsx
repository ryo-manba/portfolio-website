"use client";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import type {
  TabPanelProps, TabProps
} from 'react-aria-components';
import type { Post } from "@/app/posts/types";

import { BlogList } from "@/app/posts/components/BlogList";

export type BlogTabProps = {
  zennPosts: Post[];
  notePosts: Post[];
  hatenaPosts: Post[];
  qiitaPosts: Post[];
}

export const BlogTabs = ({zennPosts, notePosts, hatenaPosts, qiitaPosts}: BlogTabProps) => {
  const allPosts = [...hatenaPosts, ...notePosts, ...qiitaPosts, ...zennPosts].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Tabs className='w-full px-12 mb-4'>
      <TabList aria-label="Blog Posts" className='flex space-x-1 rounded-full bg-[#F1F1F1] bg-clip-padding p-1 border border-solid border-white/30'>
        <MyTab id="all">All Posts</MyTab>
        <MyTab id="zenn">Zenn</MyTab>
        <MyTab id="note">note</MyTab>
        <MyTab id="hatena">Hatena Blog</MyTab>
        <MyTab id="qiita">Qiita</MyTab>
      </TabList>
      <MyTabPanel id="all">
        <BlogList posts={allPosts} />
      </MyTabPanel>
      <MyTabPanel id="zenn">
        <BlogList posts={zennPosts} />
      </MyTabPanel>
      <MyTabPanel id="note">
        <BlogList posts={notePosts} />
      </MyTabPanel>
      <MyTabPanel id="hatena">
        <BlogList posts={hatenaPosts} />
      </MyTabPanel>
      <MyTabPanel id="qiita">
        <BlogList posts={qiitaPosts} />
      </MyTabPanel>
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
          ? 'text-white bg-blue-500 shadow'
          : 'text-gray-600 bg-gray-200 hover:bg-gray-300 pressed:bg-gray-300'
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

