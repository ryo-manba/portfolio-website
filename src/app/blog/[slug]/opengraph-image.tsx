import { OG_CONTENT_TYPE, OG_SIZE, loadGoogleFont } from "@/lib/og";
import { ImageResponse } from "next/og";
import { getBlogPost, getBlogPosts } from "../utils/getBlogPosts";

export const alt = "Blog post";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

const SITE_NAME = "ryo-manba";
const FONT_FAMILY = "Noto Sans JP";

/** タイトル長に応じてフォントサイズを調整し、長文でも収まるようにする。 */
function titleFontSize(title: string): number {
  if (title.length <= 24) return 64;
  if (title.length <= 40) return 52;
  return 42;
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);

  const title = post?.title ?? "記事が見つかりません";
  const tags = post?.tags ?? [];
  const dateText = post
    ? new Date(post.date).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })
    : "";

  // サブセット取得のため、描画する全文字を収集する。
  const text = `${SITE_NAME}${title}${dateText}${tags.join("")}`;
  const [regular, bold] = await Promise.all([
    loadGoogleFont(FONT_FAMILY, 400, text),
    loadGoogleFont(FONT_FAMILY, 700, text),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
          borderLeft: "16px solid #2563eb",
          fontFamily: FONT_FAMILY,
        }}
      >
        {/* ブランド */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9999, background: "#2563eb" }} />
          <div style={{ fontSize: 30, fontWeight: 700, color: "#1e3a8a" }}>{SITE_NAME}</div>
        </div>

        {/* タイトル */}
        <div
          style={{
            display: "flex",
            fontSize: titleFontSize(title),
            fontWeight: 700,
            lineHeight: 1.35,
            color: "#0f172a",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>

        {/* メタ情報 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 26, color: "#475569" }}>{dateText}</div>
          <div style={{ display: "flex", gap: 12 }}>
            {tags.slice(0, 3).map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#1d4ed8",
                  background: "#dbeafe",
                  padding: "8px 20px",
                  borderRadius: 9999,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: FONT_FAMILY, data: regular, weight: 400, style: "normal" },
        { name: FONT_FAMILY, data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
