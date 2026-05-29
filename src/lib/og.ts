/**
 * OGP 画像生成で共通利用するユーティリティ。
 *
 * `@vercel/og`(next/og) に同梱されるフォントは latin のみのため、日本語タイトルは
 * そのままでは描画できない。Google Fonts の css2 API から「実際に使う文字」だけの
 * サブセットを取得し、フォントバイナリを ImageResponse に渡すことで日本語を描画する。
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/**
 * Google Fonts から指定ウェイトのフォントバイナリを取得する。
 *
 * `text` に渡した文字のみを含むサブセットを取得するため、フルフォント(数 MB)を
 * 読み込む必要がない。satori は woff2 を解釈できないので、modern な User-Agent は
 * 付けず truetype/opentype が返るようにしている。
 */
export async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@${weight}&text=${encodeURIComponent(text)}`;

  const cssRes = await fetch(url);
  if (!cssRes.ok) {
    throw new Error(`Failed to fetch font CSS for ${family} (${cssRes.status})`);
  }
  const css = await cssRes.text();

  const fontUrl = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!fontUrl) {
    throw new Error(`Failed to extract font URL for ${family}`);
  }

  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) {
    throw new Error(`Failed to download font binary for ${family} (${fontRes.status})`);
  }
  return fontRes.arrayBuffer();
}
