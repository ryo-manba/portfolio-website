import type { Post, PostRawData } from "@/app/posts/types";
import { convertDateFormatToISO } from "@/app/posts/utils/convertDateFormatToISO";
import { xmlToJson } from "@/app/posts/utils/xmlToJson";
import axios from "axios";

const NOTE_USER_ID = "ryo_manba";
const END_POINT = `https://note.com/${NOTE_USER_ID}/rss`;

const getNoteData = async () => {
  try {
    const response = await axios.get(END_POINT);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    return undefined;
  }
};

const extractItems = async (data: string) => {
  const jsonItem = await xmlToJson(data);

  const entries: PostRawData[] = jsonItem.rss.channel[0].item.map(
    // biome-ignore lint/suspicious/noExplicitAny: xml の型を定義するのが大変なので any にしている
    (item: any) => ({
      title: item.title[0],
      url: item.link[0],
      date: item.pubDate[0],
    }),
  );
  return entries;
};

export async function fetchNotePosts(): Promise<Post[]> {
  try {
    const xmlData = await getNoteData();
    const entries = await extractItems(xmlData);

    const posts: Post[] = entries.map((item) => {
      const post: Post = {
        name: "りょう",
        domain: "note.com",
        favicon: "/images/note-logo.png",
        title: item.title,
        url: item.url,
        createdAt: convertDateFormatToISO(item.date),
      };
      return post;
    });

    return posts;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    return [];
  }
}
