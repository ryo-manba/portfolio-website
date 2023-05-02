import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import type { Post, PostRawData } from '@/types/post';

const PROXY_PATH = '/api/hatena';

export const useHatena = () => {
  const { data, error, isLoading } = useSWR<PostRawData[]>(PROXY_PATH, fetcher);

  const posts: Post[] = useMemo(() => {
    if (!data) return [];
    return data.map((item) => {
      const post: Post = {
        name: 'taro',
        domain: 'hatenablog.com',
        favicon: '/images/hatenablog-logo.svg',
        title: item.title,
        url: item.url,
        createdAt: item.date,
      };
      return post;
    });
  }, [data]);

  return {
    posts,
    isLoading,
    error,
  };
};
