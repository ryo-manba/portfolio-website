import type { Post, PostRawData } from "@/app/posts/types";
import axios from "axios";

const QIITA_USER_ID = "ryo_manba";
const QIITA_ACCESS_TOKEN = process.env.QIITA_ACCESS_TOKEN;
const END_POINT = `https://qiita.com/api/v2/users/${QIITA_USER_ID}/items`;

export async function fetchQiitaPosts(): Promise<Post[]> {
  try {
    const response = await axios.get(END_POINT, {
      headers: {
        Authorization: `Bearer ${QIITA_ACCESS_TOKEN}`,
      },
    });

    // biome-ignore lint/suspicious/noExplicitAny: xml の型を定義するのが大変なので any にしている
    const data: PostRawData[] = response.data.map((post: any) => ({
      title: post.title,
      url: post.url,
      date: post.created_at,
    }));

    const posts: Post[] = data.map((content) => {
      const post: Post = {
        name: "ryo_manba",
        domain: "qiita.com",
        favicon: "/images/qiita-logo.png",
        title: content.title,
        url: content.url,
        createdAt: content.date,
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
