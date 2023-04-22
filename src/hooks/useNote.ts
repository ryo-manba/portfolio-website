import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// TODO: 型定義を別ファイルにまとめる
type Post = {
  name: string;
  domain: string;
  favicon: string;
  title: string;
  url: string;
  createdAt: string;
  rss?: string;
};

type User = {
  name: string;
};

type Contents = Content[];
type Content = {
  body: string;
  eyecatch: string;
  name: string;
  noteUrl: string;
  user: User;
  publishAt: string;
};

const PROXY_PATH = '/api/note';
export const useNote = (page: number) => {
  const { data, error, isLoading } = useSWR(
    `${PROXY_PATH}?page=${page}`,
    fetcher,
  );

  const contents: Contents = useMemo(() => {
    return data?.data?.contents || [];
  }, [data]);

  const posts: Post[] = useMemo(() => {
    return contents.map((content) => {
      const post: Post = {
        name: content.user.name,
        domain: 'note.com',
        favicon: '/images/note-mark.png',
        title: content.name,
        url: content.noteUrl,
        createdAt: content.publishAt,
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
