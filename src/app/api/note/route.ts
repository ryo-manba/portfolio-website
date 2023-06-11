import { NextResponse } from 'next/server';
import type { PostRawData } from '@/app/posts/types';
import { xmlToJson } from '@/app/posts/utils/xmlToJson';

const NOTE_USER_ID = 'ryo_manba';
const END_POINT = `https://note.com/${NOTE_USER_ID}/rss`;

const getNoteData = async () => {
  const res = await fetch(END_POINT, {
    next: { revalidate: 60 * 60 * 24 }, // Revalidate every 1 day
  });
  const data = await res.text();
  return data;
};

const extractItems = async (data: string) => {
  const jsonItem = await xmlToJson(data);
  const entries: PostRawData[] = jsonItem.rss.channel[0].item.map(
    (item: any) => ({
      title: item.title[0],
      url: item.link[0],
      date: item.pubDate[0],
    }),
  );
  return entries;
};

export async function GET() {
  try {
    const xmlData = await getNoteData();
    const entries = await extractItems(xmlData);
    return NextResponse.json({ data: entries });
  } catch (error) {
    return NextResponse.json({
      error: { status: 500, message: 'Internal Server Error' },
    });
  }
}
