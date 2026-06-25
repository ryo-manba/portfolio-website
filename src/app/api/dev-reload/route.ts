import { subscribe } from "./contentWatcher";

// fs.watch を使うため Node ランタイム固定。キャッシュも無効化。
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request): Response {
  // 本番では存在しないルートとして扱う（二重ガードの一段目）
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // 接続確立のコメント行
      controller.enqueue(encoder.encode(": connected\n\n"));

      const send = () => {
        controller.enqueue(encoder.encode("data: change\n\n"));
      };
      const unsubscribe = subscribe(send);

      // クライアント切断でクリーンアップ
      request.signal.addEventListener("abort", () => {
        unsubscribe();
        try {
          controller.close();
        } catch {
          // 既に閉じている場合は無視
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
