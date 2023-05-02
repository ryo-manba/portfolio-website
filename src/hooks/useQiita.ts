import useSWR from 'swr';
import { useMemo } from 'react';
import { Post } from '../types/Post';
import { fetcher } from '../utils/fetcher';

export type QiitaPost = {
  createdAt: string;
  title: string;
  url: string;
};

const END_POINT = '/api/qiita';

export const useQiita = () => {
  const { data, error, isLoading } = useSWR<QiitaPost[]>(END_POINT, fetcher);

  const posts: Post[] = useMemo(() => {
    if (!data) return [];
    return data.map((content) => {
      const post: Post = {
        name: 'ryo_manba',
        domain: 'qiita.com',
        favicon: '/images/qiita-logo.png',
        title: content.title,
        url: content.url,
        createdAt: content.createdAt,
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
