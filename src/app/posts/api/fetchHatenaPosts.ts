import axios from 'axios';
import type { Post } from '@/app/posts/types';
import { xmlToJson } from '@/app/posts/utils/xmlToJson';

const HATENA_ID = 'ryo_manba';
const BLOG_ID = 'ryo-manba.hatenablog.com';
const END_POINT = `https://blog.hatena.ne.jp/${HATENA_ID}/${BLOG_ID}/atom/entry`;

type Entry = {
  'app:control': [{ 'app:draft': string[] }];
  published: string[];
  title: string[];
  link: { href: string[] }[];
};

type HatenaLink = {
  rel: string[];
  href: string[];
};

const getHatenaData = async (url: string) => {
  const response = await axios.get(url, {
    auth: {
      username: HATENA_ID,
      password: process.env.HATENA_PASSWORD ?? '',
    },
  });
  return response;
};

const parseResponseData = async (responseData: string) => {
  const result = await xmlToJson(responseData);
  const entry = result.feed.entry;

  const links = result.feed.link;
  // 'next'リンクがある場合は、次のページのURLを取得する
  const nextLink = links.find((link: HatenaLink) => link.rel[0] === 'next');
  const nextUrl = nextLink ? nextLink.href[0] : null;

  return { entry, nextUrl };
};
export async function fetchHatenaPosts(): Promise<Post[]> {
  try {
    let entries: Entry[] = [];
    let url = END_POINT;
    while (url) {
      const response = await getHatenaData(url);
      const { entry, nextUrl } = await parseResponseData(response.data);
      entries = [...entries, ...entry];
      url = nextUrl;
    }

    const posts: Post[] = entries
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
