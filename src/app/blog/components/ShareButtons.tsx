"use client";

import { useEffect, useState } from "react";
import { FaLink, FaShareNodes, FaXTwitter } from "react-icons/fa6";
import { MdCheck } from "react-icons/md";
import { SiHatenabookmark } from "react-icons/si";

type Props = {
  url: string;
  title: string;
};

export function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  // Web Share API はモバイル中心の機能なので、利用可能な場合のみ表示する
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const hatenaShareUrl = `https://b.hatena.ne.jp/add?mode=confirm&url=${encodeURIComponent(
    url,
  )}&title=${encodeURIComponent(title)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // no-op: ユーザーが共有をキャンセルした場合などは何もしない
    }
  };

  const itemClassName =
    "flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 transition-colors hover:bg-gray-100";

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="この記事をシェア">
      <a href={xShareUrl} target="_blank" rel="noopener noreferrer" className={itemClassName} aria-label="X でシェア">
        <FaXTwitter className="w-4 h-4" aria-hidden="true" />
      </a>

      <a
        href={hatenaShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClassName}
        aria-label="はてなブックマークに追加"
      >
        <SiHatenabookmark className="w-4 h-4" aria-hidden="true" />
      </a>

      <button type="button" onClick={handleCopy} className={itemClassName} aria-label="リンクをコピー">
        {copied ? (
          <MdCheck className="w-4 h-4" aria-hidden="true" />
        ) : (
          <FaLink className="w-4 h-4" aria-hidden="true" />
        )}
        {copied ? "コピーしました" : "リンクをコピー"}
      </button>

      {canShare && (
        <button type="button" onClick={handleNativeShare} className={itemClassName} aria-label="共有">
          <FaShareNodes className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
