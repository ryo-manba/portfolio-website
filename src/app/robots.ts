import type { MetadataRoute } from "next";

// 絶対 URL の基準となるサイト URL（layout.tsx の metadataBase と同様にフォールバックを用意）
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // API と検索結果ページはクロール対象から除外する
      disallow: ["/api/", "/search"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
