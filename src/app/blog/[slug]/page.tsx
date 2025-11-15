import { Metadata } from "next";
import { notFound } from "next/navigation";
import type React from "react";
import { getBlogPost, getBlogPosts } from "../utils/getBlogPosts";
import { BlogPostContent } from "./BlogPostContent";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-3xl font-bold mt-6 mb-3" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-2xl font-bold mt-4 mb-2" {...props} />,
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h4 className="text-xl font-bold mt-3 mb-2" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="my-4 leading-relaxed" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc list-inside my-4 space-y-2" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal list-inside my-4 space-y-2" {...props} />,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="ml-4" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
  ),
  // biome-ignore lint/a11y/useAltText: alt text is provided via MDX content props
  img: ({ alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img className="max-w-full h-auto my-4 rounded-lg" alt={alt} {...props} />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => <hr className="my-8 border-t border-gray-300" {...props} />,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-gray-200" {...props} />
    </div>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th className="px-4 py-2 bg-gray-100 text-left font-semibold" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableDataCellElement>) => <td className="px-4 py-2 border-t" {...props} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-bold" {...props} />,
};

type Props = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {
      title: "記事が見つかりません",
    };
  }

  return {
    title: post.title,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
    },
    twitter: {
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPost({ params }: Props) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="max-w-screen-lg mx-auto px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <time className="text-gray-600 block mb-4">{formattedDate}</time>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      <BlogPostContent content={post.content} lang={post.lang}>
        <MDXRemote
          source={post.content}
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeHighlight],
            },
          }}
        />
      </BlogPostContent>
    </article>
  );
}
