import type { Meta, StoryObj } from "@storybook/react";
import { MdAccessTime, MdCalendarToday } from "react-icons/md";
import Link from "next/link";
import { Breadcrumb } from "../components/Breadcrumb";
import { CopyMarkdownButton } from "../components/CopyMarkdownButton";
import { LikeButton } from "../components/LikeButton";
import { TableOfContents } from "../components/TableOfContents";
import type { TocItem } from "../utils/extractHeadings";
import { BlogPostLayout } from "./BlogPostLayout";

const title = "タスクキューで画像リサイズを非同期化する";
const slug = "blog-post-page-demo";
const tags = ["Python", "Celery", "Redis"];
const likeCount = 128;

const markdownContent = [
  "## はじめに",
  "画像アップロードのたびにリサイズを同期処理していると、レスポンスが遅くなります。",
  "## アーキテクチャ",
  "Celery と Redis を組み合わせてジョブをキューに積み、ワーカーで処理します。",
  "### ワーカーの構成",
  "複数ワーカーを起動し、水平にスケールさせます。",
  "## まとめ",
  "非同期化でレスポンスタイムを大幅に改善できました。",
].join("\n\n");

const headings: TocItem[] = [
  { id: "title", text: title, level: 1 },
  { id: "はじめに", text: "はじめに", level: 2 },
  { id: "アーキテクチャ", text: "アーキテクチャ", level: 2 },
  { id: "ワーカーの構成", text: "ワーカーの構成", level: 3 },
  { id: "まとめ", text: "まとめ", level: 2 },
];

const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: title }];

const header = (
  <>
    <Breadcrumb items={breadcrumbItems} />

    <header className="mb-8 mt-4">
      <h1 id="title" className="text-2xl md:text-3xl font-bold mb-6 leading-tight text-gray-900 scroll-mt-24">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
        <time dateTime="2026-06-15" className="flex items-center gap-2">
          <MdCalendarToday className="w-4 h-4" aria-hidden="true" />
          June 15, 2026
        </time>

        <span className="flex items-center gap-2" aria-label="Reading time: 5 min read">
          <MdAccessTime className="w-4 h-4" aria-hidden="true" />5 min read
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2" role="list" aria-label="Tags">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${tag}`}
              className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors"
              role="listitem"
            >
              {tag}
            </Link>
          ))}
        </div>
        <CopyMarkdownButton content={markdownContent} />
      </div>
    </header>
  </>
);

const body = (
  <>
    <h2 className="text-3xl font-bold mt-10 mb-5 leading-tight text-gray-900 scroll-mt-24">はじめに</h2>
    <p className="mb-8 leading-relaxed text-gray-700 text-base md:text-lg" style={{ lineHeight: "1.6" }}>
      画像アップロードのたびにリサイズを同期処理していると、レスポンスが遅くなります。本記事ではタスクキューで非同期化する方法を解説します。
    </p>
    <h2 className="text-3xl font-bold mt-10 mb-5 leading-tight text-gray-900 scroll-mt-24">アーキテクチャ</h2>
    <p className="mb-8 leading-relaxed text-gray-700 text-base md:text-lg" style={{ lineHeight: "1.6" }}>
      Celery と Redis を組み合わせてジョブをキューに積み、ワーカーで処理します。リクエストは即座にジョブIDを返します。
    </p>
    <h3 className="text-2xl font-bold mt-8 mb-4 leading-tight text-gray-900 scroll-mt-24">ワーカーの構成</h3>
    <p className="mb-8 leading-relaxed text-gray-700 text-base md:text-lg" style={{ lineHeight: "1.6" }}>
      複数ワーカーを起動し、負荷に応じて水平にスケールさせます。
    </p>
    <h2 className="text-3xl font-bold mt-10 mb-5 leading-tight text-gray-900 scroll-mt-24">まとめ</h2>
    <p className="mb-8 leading-relaxed text-gray-700 text-base md:text-lg" style={{ lineHeight: "1.6" }}>
      非同期化でレスポンスタイムを大幅に改善できました。
    </p>
  </>
);

const meta = {
  title: "Blog/BlogPostPage",
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  render: () => (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-8 flex justify-center gap-5">
        <BlogPostLayout
          content={markdownContent}
          lang="ja"
          header={header}
          footer={
            <div className="xl:hidden mt-12 pt-8 border-t border-gray-200 flex justify-center">
              <LikeButton slug={slug} initialCount={likeCount} />
            </div>
          }
        >
          {body}
        </BlogPostLayout>

        <div className="hidden xl:flex flex-col gap-6 sticky top-24 self-start shrink-0 ml-3">
          <TableOfContents headings={headings} />
          <LikeButton slug={slug} initialCount={likeCount} />
        </div>
      </div>
    </div>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
