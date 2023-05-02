import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
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

type HatenaPost = {
  day: string;
  title: string;
  href: string;
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

const extractItemsAndNextUri = async (data: string) => {
  const result = await xmlToJson(data);
  const entry: Entry[] = result.feed.entry;
  const nextUrl = result.feed.link[1].href;
  return { entry, nextUrl };
};

const convertEntriesToItems = (entry: Entry[]): HatenaPost[] => {
  return entry
    .filter((e) => e['app:control'][0]['app:draft'][0] !== 'yes')
    .map((e) => ({
      day: e.published[0],
      title: e.title[0],
      href: e.link[1].href[0],
    }));
};

export default async function hatena(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const xmlData = await getHatenaData();
  const { entry } = await extractItemsAndNextUri(xmlData);
  const hatenaPosts = convertEntriesToItems(entry);

  res.status(200).json(hatenaPosts);
}
