import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

type Post = {
  name: string;
  domain: string;
  favicon: string;
  title: string;
  url: string;
  createdAt: string;
};

export type QiitaPost = {
  createdAt: string;
  title: string;
  url: string;
};

const END_POINT = '/api/qiita';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

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
