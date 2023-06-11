import axios from 'axios';
import type { Post, PostRawData } from '@/app/posts/types';
import { xmlToJson } from '@/app/posts/utils/xmlToJson';
import { convertDateFormatToISO } from '@/app/posts/utils/convertDateFormatToISO';

const ZENN_USER_ID = 'ryo_manba';
const END_POINT = `https://zenn.dev/${ZENN_USER_ID}/feed`;

const getZennData = async () => {
  try {
    const response = await axios.get(END_POINT);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    return undefined;
  }
};

const extractItems = async (data: string) => {
  const result = await xmlToJson(data);
  const entries: PostRawData[] = result.rss.channel[0].item.map(
    (item: any) => ({
      title: item.title[0],
      url: item.link[0],
      date: convertDateFormatToISO(item.pubDate[0]),
      author: item['dc:creator'][0],
    }),
  );
  return entries;
};

export async function fetchZennPosts(): Promise<Post[]> {
  try {
    const xmlData = await getZennData();
    const entries = await extractItems(xmlData);

    const posts: Post[] = entries.map((content) => {
      const post: Post = {
        name: content.author || 'りょう',
        domain: 'zenn.dev',
        favicon: '/images/zenn-logo.svg',
        title: content.title,
        url: content.url,
        createdAt: content.date,
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
