"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// dev 専用: /api/dev-reload の SSE を購読し、mdx 変更時に RSC を再取得する。
// 描画は持たない。本番では親側のガードでそもそも描画されない。
export function DevContentReload() {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource("/api/dev-reload");
    source.onmessage = () => {
      router.refresh();
    };
    // EventSource はネットワーク断時に自動再接続する
    return () => {
      source.close();
    };
  }, [router]);

  return null;
}
