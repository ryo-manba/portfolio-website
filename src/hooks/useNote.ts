import useSWR from 'swr';
import { useMemo } from 'react';
import { Post } from '@/types/Post';
import { fetcher } from '@/utils/fetcher';

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
