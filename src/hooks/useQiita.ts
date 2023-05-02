import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from '@/utils/fetcher';
import type { Post, PostRawData } from '@/types/post';

const END_POINT = '/api/qiita';

export const useQiita = () => {
  const { data, error, isLoading } = useSWR<PostRawData[]>(END_POINT, fetcher);

  const posts: Post[] = useMemo(() => {
    if (!data) return [];
    return data.map((content) => {
      const post: Post = {
        name: 'ryo_manba',
        domain: 'qiita.com',
        favicon: '/images/qiita-logo.png',
        title: content.title,
        url: content.url,
        createdAt: content.date,
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
