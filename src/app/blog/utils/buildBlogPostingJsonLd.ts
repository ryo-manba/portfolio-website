import { BlogPost } from "../types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const AUTHOR_NAME = "Ryo Matsukawa";
const PUBLISHER_NAME = "ryo-manba";

/**
 * Build a schema.org BlogPosting JSON-LD object for a blog post.
 * リッチリザルト向けの構造化データを生成する。
 * @param post - 対象のブログ記事
 * @returns JSON-LD として埋め込める BlogPosting オブジェクト
 */
export function buildBlogPostingJsonLd(post: BlogPost): Record<string, unknown> {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  // OG 画像は専用ルートで動的生成する（別ブランチで追加）。絶対 URL で参照する。
  const imageUrl = `${SITE_URL}/blog/${post.slug}/opengraph-image`;
  const publishedDate = new Date(post.date).toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: publishedDate,
    // 更新日時の情報がないため公開日時と同じ値を使う
    dateModified: publishedDate,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    publisher: {
      "@type": "Person",
      name: PUBLISHER_NAME,
    },
    image: imageUrl,
    keywords: post.tags ?? [],
    url: postUrl,
    mainEntityOfPage: postUrl,
    inLanguage: post.lang || "ja",
  };
}
