import axios from 'axios';
import type { Post, PostRawData } from '@/app/posts/types';
import { convertDateFormatToISO } from '@/app/posts/utils/convertDateFormatToISO';

const END_POINT = process.env.NEXT_PUBLIC_SITE_URL + '/api/note';

export async function fetchNotePosts(): Promise<Post[]> {
  try {
    const response = await axios.get(END_POINT);

    const data: PostRawData[] = response.data;

    const posts: Post[] = data.map((item) => {
      const post: Post = {
        name: 'りょう',
        domain: 'note.com',
        favicon: '/images/note-logo.png',
        title: item.title,
        url: item.url,
        createdAt: convertDateFormatToISO(item.date),
      };
      return post;
    });

    return posts;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    return [];
  }
}
