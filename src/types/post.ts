export type PostRawData = {
  title: string;
  url: string;
  date: string;
  author?: string;
};

export type Post = {
  name: string;
  domain: string;
  favicon: string;
  title: string;
  url: string;
  createdAt: string;
};
