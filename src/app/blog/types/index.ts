export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags?: string[];
  content: string;
};

export type BlogPostMetadata = Omit<BlogPost, "content">;
