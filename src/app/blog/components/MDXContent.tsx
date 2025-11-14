"use client";

import { MDXProvider } from "@mdx-js/react";
import type React from "react";
import { ReactNode } from "react";

type MDXContentProps = {
  children: ReactNode;
};

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
};

export const MDXContent = ({ children }: MDXContentProps) => {
  return <MDXProvider components={components}>{children}</MDXProvider>;
};
