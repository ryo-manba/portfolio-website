import { OG_CONTENT_TYPE, OG_SIZE, loadGoogleFont } from "@/lib/og";
import { ImageResponse } from "next/og";

export const alt = "ryo-manba";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const SITE_NAME = "ryo-manba";
const TAGLINE = "Ryo Matsukawa のポートフォリオサイト";
const FONT_FAMILY = "Noto Sans JP";

export default async function Image() {
  const text = `${SITE_NAME}${TAGLINE}`;
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
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>{SITE_NAME}</div>
        <div style={{ fontSize: 34, fontWeight: 400, color: "#dbeafe" }}>{TAGLINE}</div>
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
