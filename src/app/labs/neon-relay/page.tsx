import type { Metadata } from "next";
import { NeonRelayGame } from "./NeonRelayGame";

export const metadata: Metadata = {
  title: "Neon Relay — 3D Arena",
  description:
    "射撃・ダッシュ・パルスを使い、コアを回収して3ウェーブを突破する3Dブラウザゲーム。HTML-in-Canvasの立体パネルも実験できます。",
};

export default function NeonRelayPage() {
  return <NeonRelayGame />;
}
