import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPost, BlogPostMetadata } from "../types";

const contentDirectory = path.join(process.cwd(), "content/blog");

export function getBlogPosts(): BlogPostMetadata[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const files = fs.readdirSync(contentDirectory);
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

  const posts = mdxFiles.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const filePath = path.join(contentDirectory, file);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString(),
      description: data.description || "",
      tags: data.tags || [],
    };
  });

  // sort by date descending
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    const filePath = path.join(contentDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString(),
      description: data.description || "",
      tags: data.tags || [],
      content,
    };
  } catch (error) {
    return null;
  }
}
