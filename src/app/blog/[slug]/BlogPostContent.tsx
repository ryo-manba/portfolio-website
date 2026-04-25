"use client";

import { sanitizeImageUrl, sanitizeUrl } from "@/lib/sanitize";
import { type ReactNode, useState } from "react";
import type React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
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
  a: ({ href, title, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const safeHref = sanitizeUrl(href);
    const isExternal = safeHref?.startsWith("http://") || safeHref?.startsWith("https://");
    return (
      <a
        className="text-blue-600 hover:text-blue-800 underline underline-offset-2 decoration-2 transition-colors"
        href={safeHref}
        title={title}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-blue-500 bg-blue-50 pl-6 pr-4 py-4 mb-8 italic text-gray-700 rounded-r"
      style={{ lineHeight: "1.6" }}
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <code className={className} {...rest}>
        {children}
      </code>
    ) : (
      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...rest}>
        {children}
      </code>
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-gray-900 text-gray-100 p-5 rounded-lg overflow-x-auto my-8 text-sm leading-6" {...props} />
  ),
  img: ({ src, alt = "", width, height, loading, title }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      className="max-w-full h-auto my-8 rounded-lg shadow-md"
      src={sanitizeImageUrl(typeof src === "string" ? src : undefined)}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      title={title}
    />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => <hr className="my-12 border-t-2 border-gray-200" {...props} />,
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
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-bold text-gray-900" {...props} />,
};

type Props = {
  children: ReactNode;
  translatedContent: string | null;
};

export function BlogPostContent({ children, translatedContent }: Props) {
  if (translatedContent) {
    return (
      <div className="max-w-none text-left">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {translatedContent}
        </ReactMarkdown>
      </div>
    );
  }

  return <div className="max-w-none text-left">{children}</div>;
}
