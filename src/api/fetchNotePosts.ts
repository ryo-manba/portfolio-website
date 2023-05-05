import axios from 'axios';
import type { Post, PostRawData } from '@/types/post';

const END_POINT = process.env.NEXT_PUBLIC_SITE_URL + '/api/note';

// ex) "Tue, 28 Mar 2023 20:29:07 +0900" -> "2023-03-28T11:29:07.000Z"
const convertToIsoDate = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toISOString();
  return formattedDate;
};

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
        createdAt: convertToIsoDate(item.date),
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
