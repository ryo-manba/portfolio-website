import type { MetadataRoute } from "next";
import { getBlogPosts } from "./blog/utils/getBlogPosts";

// 絶対 URL の基準となるサイト URL（layout.tsx の metadataBase と同様にフォールバックを用意）
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// トップレベルの静的公開ページ
const staticPaths = ["/blog", "/works", "/skills", "/posts"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ホームページ（優先度最高）
  const home: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ブログ記事（lastModified は各記事の date から設定）
  const blogPages: MetadataRoute.Sitemap = getBlogPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...home, ...staticPages, ...blogPages];
}
