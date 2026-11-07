import type { Metadata } from "next";
import { HtmlInCanvasDemo } from "./HtmlInCanvasDemo";

export const metadata: Metadata = {
  title: "HTML-in-Canvas Demo",
  description: "Canvasの中でHTMLの入力欄やボタンを操作できる、HTML-in-Canvas APIの実験ページ。",
};

export default function HtmlInCanvasPage() {
  return <HtmlInCanvasDemo />;
}
