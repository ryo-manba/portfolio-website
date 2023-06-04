import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import type { PostRawData } from '@/types/post';
import { xmlToJson } from '@/utils/xmlToJson';

const NOTE_USER_ID = 'ryo_manba';
const END_POINT = `https://note.com/${NOTE_USER_ID}/rss`;

const getNoteData = async () => {
  try {
    const response = await axios.get(END_POINT);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const extractItems = async (data: string) => {
  const result = await xmlToJson(data);
  const entries: PostRawData[] = result.rss.channel[0].item.map(
    (item: any) => ({
      title: item.title[0],
      url: item.link[0],
      date: item.pubDate[0],
    }),
  );
  return entries;
};

export default async function note(req: NextApiRequest, res: NextApiResponse) {
  const xmlData = await getNoteData();
  const entries = await extractItems(xmlData);
  res.status(200).json(entries);
}
