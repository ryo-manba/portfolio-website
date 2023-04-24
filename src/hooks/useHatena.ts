import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// TODO: 型定義を別ファイルにまとめる
type HatenaPost = {
  name: string;
  domain: string;
  favicon: string;
  title: string;
  url: string;
  createdAt: string;
};

type Contents = Content[];

type Content = {
  day: string;
  title: string;
  href: string;
};

const PROXY_PATH = '/api/hatena';
export const useHatena = () => {
  const { data, error, isLoading } = useSWR(PROXY_PATH, fetcher);

  console.log('data', data);

  const contents: Contents = useMemo(() => {
    return data || [];
  }, [data]);

  const posts: HatenaPost[] = useMemo(() => {
    return contents.map((content) => {
      const post: HatenaPost = {
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
