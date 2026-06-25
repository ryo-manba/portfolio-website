"use client";

import { FaMastodon } from "react-icons/fa6";
import { SiHatenabookmark } from "react-icons/si";

type Props = {
  url: string;
  title: string;
};

export function ShareButtons({ url, title }: Props) {
  const hatenaShareUrl = `https://b.hatena.ne.jp/add?mode=confirm&url=${encodeURIComponent(
    url,
  )}&title=${encodeURIComponent(title)}`;

  const handleMastodon = () => {
    const instance = window.prompt(
      "Mastodon インスタンスを入力してください",
      "mastodon.social",
    );
    if (!instance) return;
    const text = encodeURIComponent(`${title}\n${url}`);
    window.open(`https://${instance}/share?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const itemClassName =
    "flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 transition-colors hover:bg-gray-100";

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="この記事をシェア">
      <button type="button" onClick={handleMastodon} className={itemClassName} aria-label="Mastodon でシェア">
        <FaMastodon className="w-4 h-4" aria-hidden="true" />
      </button>

      <a
        href={hatenaShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClassName}
        aria-label="はてなブックマークに追加"
      >
        <SiHatenabookmark className="w-4 h-4" aria-hidden="true" />
      </a>
    </div>
  );
}
