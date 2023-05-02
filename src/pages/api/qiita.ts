import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { PostRawData } from '@/types/post';

const QIITA_USER_ID = 'ryo_manba';
const QIITA_ACCESS_TOKEN = process.env.QIITA_ACCESS_TOKEN;
const END_POINT = `https://qiita.com/api/v2/users/${QIITA_USER_ID}/items`;

export default async function qiita(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get(END_POINT, {
      headers: {
        Authorization: `Bearer ${QIITA_ACCESS_TOKEN}`,
      },
    });

    const data: PostRawData = response.data.map((post: any) => ({
      title: post.title,
      url: post.url,
      date: post.created_at,
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching Qiita posts.' });
  }
}
