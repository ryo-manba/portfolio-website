import type { Metadata } from "next";
import { NeonRelayGame } from "./NeonRelayGame";

export const metadata: Metadata = {
  title: "Neon Relay — 3D Arena",
  description:
    "3ウェーブを突破する3Dブラウザゲーム。日本語入力・文字選択・スクロールができる立体端末で、HTML-in-Canvasと普通のCanvasを比較できます。",
};

export default function NeonRelayPage() {
  return <NeonRelayGame />;
}
