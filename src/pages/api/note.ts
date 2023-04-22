import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

// TODO: RSSのURLに変更する
const END_POINT = 'https://note.com/api/v2/creators/ryo_manba/contents';

export default async function note(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get(
      `${END_POINT}?kind=note&page=${req.query.page}`,
    );
    res.status(200).json(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      res
        .status(error.response?.status || 500)
        .json({ message: error.message });
    } else {
      const genericError = error as Error;
      res.status(500).json({ message: genericError.message });
    }
  }
}
