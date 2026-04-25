import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPost, BlogPostMetadata } from "../types";

const contentDirectory = path.join(process.cwd(), "content/blog");

const SLUG_PATTERN = /^[a-z0-9-]+$/;

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
      lang: data.lang,
    };
  });

  // sort by date descending
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  // Defensive validation: only allow lowercase alphanumeric and hyphen.
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    return null;
  }

  try {
    const filePath = path.resolve(contentDirectory, `${slug}.mdx`);

    // Ensure the resolved path stays within contentDirectory to prevent
    // path traversal attacks.
    if (!filePath.startsWith(contentDirectory + path.sep)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString(),
      description: data.description || "",
      tags: data.tags || [],
      lang: data.lang,
      content,
    };
  } catch (error) {
    return null;
  }
}
