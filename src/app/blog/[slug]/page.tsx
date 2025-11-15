import { Metadata } from "next";
import { notFound } from "next/navigation";
import type React from "react";
import { getBlogPost, getBlogPosts } from "../utils/getBlogPosts";
import { BlogPostContent } from "./BlogPostContent";
import { Breadcrumb } from "../components/Breadcrumb";
import { calculateReadingTime, formatReadingTime } from "../utils/readingTime";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { MdCalendarToday, MdAccessTime } from "react-icons/md";
import "highlight.js/styles/github-dark.css";

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold mt-12 mb-6 leading-tight text-gray-900 scroll-mt-24" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-bold mt-10 mb-5 leading-tight text-gray-900 scroll-mt-24" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-bold mt-8 mb-4 leading-tight text-gray-900 scroll-mt-24" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-xl font-bold mt-6 mb-3 leading-tight text-gray-900 scroll-mt-24" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-8 leading-relaxed text-gray-700 text-base md:text-lg" style={{ lineHeight: "1.6" }} {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-outside mb-8 space-y-3 pl-6 text-gray-700" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside mb-8 space-y-3 pl-6 text-gray-700" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-base md:text-lg" style={{ lineHeight: "1.6" }} {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-blue-600 hover:text-blue-800 underline underline-offset-2 decoration-2 transition-colors"
      {...props}
    />
  ),
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-blue-500 bg-blue-50 pl-6 pr-4 py-4 mb-8 italic text-gray-700 rounded-r"
      style={{ lineHeight: "1.6" }}
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-gray-900 text-gray-100 p-5 rounded-lg overflow-x-auto my-8 text-sm leading-6" {...props} />
  ),
  // biome-ignore lint/a11y/useAltText: alt text is provided via MDX content props
  img: ({ alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img className="max-w-full h-auto my-8 rounded-lg shadow-md" alt={alt} {...props} />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-12 border-t-2 border-gray-200" {...props} />
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-8 rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200" {...props} />
    </div>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th className="px-6 py-3 bg-gray-50 text-left text-sm font-semibold text-gray-900" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableDataCellElement>) => (
    <td className="px-6 py-4 border-t border-gray-200 text-sm text-gray-700" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-gray-900" {...props} />
  ),
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

  const postDate = new Date(post.date);
  const formattedDate = postDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { minutes, charCount } = calculateReadingTime(post.content);
  const readingTimeText = formatReadingTime(minutes, charCount);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ];

  return (
    <div className="min-h-screen">
      <article className="mx-auto px-4 pt-4 pb-8 text-left" style={{ maxWidth: "40em" }}>
        <Breadcrumb items={breadcrumbItems} />

        <header className="mb-8 mt-4">
          <h1
            className="text-2xl md:text-3xl font-bold mb-6 leading-tight text-gray-900"
          >
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <time dateTime={postDate.toISOString()} className="flex items-center gap-2">
              <MdCalendarToday className="w-4 h-4" aria-hidden="true" />
              {formattedDate}
            </time>

            <span className="flex items-center gap-2" aria-label={`Reading time: ${readingTimeText}`}>
              <MdAccessTime className="w-4 h-4" aria-hidden="true" />
              {readingTimeText}
            </span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2" role="list" aria-label="Tags">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium"
                  role="listitem"
                >
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
    </div>
  );
}
