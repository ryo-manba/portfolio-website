import axios from 'axios';
import type { Post } from '@/types/post';
import { xmlToJson } from '@/utils/xmlToJson';

const HATENA_ID = 'ryo_manba';
const BLOG_ID = 'ryo-manba.hatenablog.com';
const END_POINT = `https://blog.hatena.ne.jp/${HATENA_ID}/${BLOG_ID}/atom/entry`;

type Entry = {
  'app:control': [{ 'app:draft': string[] }];
  published: string[];
  title: string[];
  link: { href: string[] }[];
};

export async function fetchHatenaPosts(): Promise<Post[]> {
  try {
    const response = await axios.get(END_POINT, {
      auth: {
        username: HATENA_ID,
        password: process.env.HATENA_PASSWORD ?? '',
      },
    });

    const xmlData = response.data;
    const result = await xmlToJson(xmlData);
    const entry: Entry[] = result.feed.entry;

    const posts: Post[] = entry
      .filter((e) => e['app:control'][0]['app:draft'][0] !== 'yes')
      .map((e) => ({
        name: 'りょう',
        domain: 'hatenablog.com',
        favicon: '/images/hatenablog-logo.svg',
        title: e.title[0],
        url: e.link[1].href[0],
        createdAt: e.published[0],
      }));

    return posts;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    return [];
  }
}
