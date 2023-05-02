import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { PostRawData } from '@/types/post';
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

const getHatenaData = async () => {
  try {
    const response = await axios.get(END_POINT, {
      auth: {
        username: HATENA_ID,
        password: process.env.HATENA_PASSWORD ?? '',
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const extractItems = async (data: string) => {
  const result = await xmlToJson(data);
  const entry: Entry[] = result.feed.entry;
  const nextUrl = result.feed.link[1].href;
  return { entry, nextUrl };
};

const convertEntriesToItems = (entry: Entry[]): PostRawData[] => {
  return entry
    .filter((e) => e['app:control'][0]['app:draft'][0] !== 'yes')
    .map((e) => ({
      title: e.title[0],
      url: e.link[1].href[0],
      date: e.published[0],
    }));
};

export default async function hatena(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const xmlData = await getHatenaData();
  const { entry } = await extractItems(xmlData);
  const hatenaPosts = convertEntriesToItems(entry);

  res.status(200).json(hatenaPosts);
}
