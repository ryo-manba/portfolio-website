import { useMemo } from 'react';
import useSWR from 'swr';
import { Post } from '@/types/Post';
import { fetcher } from '@/utils/fetcher';

type Contents = Content[];

type Content = {
  day: string;
  title: string;
  href: string;
};

const PROXY_PATH = '/api/hatena';
export const useHatena = () => {
  const { data, error, isLoading } = useSWR(PROXY_PATH, fetcher);

  const contents: Contents = useMemo(() => {
    return data || [];
  }, [data]);

  const posts: Post[] = useMemo(() => {
    return contents.map((content) => {
      const post: Post = {
        name: 'taro',
        domain: 'hatenablog.com',
        favicon: '/images/hatenablog-logo.svg',
        title: content.title,
        url: content.href,
        createdAt: content.day,
      };
      return post;
    });
  }, [contents]);

  return {
    posts,
    isLoading,
    error,
  };
};
