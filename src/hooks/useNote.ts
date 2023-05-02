import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from '@/utils/fetcher';
import type { Post, PostRawData } from '@/types/post';

const PROXY_PATH = '/api/note';

// ex) "Tue, 28 Mar 2023 20:29:07 +0900" -> "2023-03-28T11:29:07.000Z"
const convertToIsoDate = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toISOString();
  return formattedDate;
};

export const useNote = () => {
  const { data, error, isLoading } = useSWR<PostRawData[]>(PROXY_PATH, fetcher);

  const posts: Post[] = useMemo(() => {
    if (!data) return [];
    return data.map((item) => {
      const post: Post = {
        name: 'りょう',
        domain: 'note.com',
        favicon: '/images/note-mark.png',
        title: item.title,
        url: item.url,
        createdAt: convertToIsoDate(item.date),
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
