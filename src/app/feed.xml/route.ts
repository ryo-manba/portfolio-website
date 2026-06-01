import { getBlogPosts } from "@/app/blog/utils/getBlogPosts";

// ブログページと同様に 1 時間ごとに再生成する
export const revalidate = 3600;

const SITE_NAME = "ryo-manba";
const SITE_DESCRIPTION = "Ryo Matsukawa のブログ記事の RSS フィードです。";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
if (!SITE_URL) throw new Error("NEXT_PUBLIC_SITE_URL is not set");

// XML 内で特殊な意味を持つ文字をエスケープする
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getBlogPosts();

  // 最新記事の日付を lastBuildDate に利用する（記事が無い場合は現在時刻）
  const lastBuildDate = posts.length > 0 ? new Date(posts[0].date) : new Date();

  const items = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/blog/${post.slug}`;
      const categories = (post.tags ?? []).map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n");

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(postUrl)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>`,
        `      <description>${escapeXml(post.description)}</description>`,
        `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
        categories,
        "    </item>",
      ]
        .filter((line) => line.length > 0)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
