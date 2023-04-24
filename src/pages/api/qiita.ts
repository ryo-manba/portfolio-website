import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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

    const data = response.data.map((post: any) => ({
      createdAt: post.created_at,
      title: post.title,
      url: post.url,
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching Qiita posts.' });
  }
}
