import fs from "node:fs";
import path from "node:path";

// getBlogPosts.ts と同じ基準ディレクトリ
const contentDir = path.join(process.cwd(), "content/blog");

// fs.watch の filename は null になり得るため null 安全に判定する
export function isRelevantContentFile(filename: string | null): boolean {
  return typeof filename === "string" && filename.endsWith(".mdx");
}

type Listener = () => void;

let watcher: fs.FSWatcher | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

function ensureWatcher(): void {
  if (watcher) return;
  watcher = fs.watch(contentDir, { recursive: true }, (_event, filename) => {
    if (!isRelevantContentFile(filename)) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    // 連続保存をまとめる
    debounceTimer = setTimeout(() => {
      listeners.forEach((listener) => listener());
    }, 100);
  });
}

// 変更通知を購読する。返り値を呼ぶと購読解除。初回呼び出しで watcher を起動。
export function subscribe(listener: Listener): () => void {
  ensureWatcher();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
