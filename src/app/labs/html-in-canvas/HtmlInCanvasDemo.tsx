"use client";

import { PageTitle } from "@/components/PageTitle";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./demo.module.css";

type DrawableCanvas = HTMLCanvasElement & {
  content?: string;
  layoutSubtree?: boolean;
  requestPaint?: () => void;
};

type DrawableContext = CanvasRenderingContext2D & {
  drawElementImage?: (element: Element, x: number, y: number, width: number, height: number) => DOMMatrix | undefined;
};

type Support = "checking" | "supported" | "unsupported" | "failed";

const EXAMPLE = `<canvas content="drawable" width="640" height="440">
  <div drawable><!-- 入力欄やボタン --></div>
</canvas>

canvas.addEventListener("paint", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawElementImage(card, 40, 40);
});
canvas.requestPaint();`;

export function HtmlInCanvasDemo() {
  const canvasRef = useRef<DrawableCanvas>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [support, setSupport] = useState<Support>("checking");
  const [markup, setMarkup] = useState<"drawable" | "layoutsubtree">("drawable");
  const [name, setName] = useState("Canvas");
  const [count, setCount] = useState(0);
  const [scale, setScale] = useState(100);
  const [angle, setAngle] = useState(0);
  const [dark, setDark] = useState(false);
  const [message, setMessage] = useState("");
  const [capabilities, setCapabilities] = useState({ content: false, legacy: false, draw: false, paint: false });

  useEffect(() => {
    const probe = document.createElement("canvas") as DrawableCanvas;
    probe.setAttribute("content", "drawable");
    probe.setAttribute("layoutsubtree", "");
    const context = probe.getContext("2d") as DrawableContext | null;
    const detected = {
      content: probe.content === "drawable",
      legacy: probe.layoutSubtree === true,
      draw: typeof context?.drawElementImage === "function",
      paint: typeof probe.requestPaint === "function",
    };
    setCapabilities(detected);
    setMarkup(detected.content ? "drawable" : "layoutsubtree");
    setSupport(
      (detected.content || detected.legacy) && detected.draw && detected.paint
        ? "supported"
        : "unsupported",
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (support !== "supported" || !canvas || !card) return;
    const context = canvas.getContext("2d") as DrawableContext | null;
    if (!context?.drawElementImage) return;
    let disposed = false;
    let cssWidth = canvas.clientWidth || 1;
    let cssHeight = canvas.clientHeight || 1;

    const paint = () => {
      if (disposed) return;
      try {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#edf3f5";
        context.fillRect(0, 0, canvas.width, canvas.height);
        const ratioX = canvas.width / cssWidth;
        const ratioY = canvas.height / cssHeight;
        const width = card.offsetWidth * ratioX;
        const height = card.offsetHeight * ratioY;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((angle * Math.PI) / 180);
        context.scale(scale / 100, scale / 100);
        // Explicit destination dimensions avoid applying devicePixelRatio twice.
        // The browser also updates the real input and button hit-test regions.
        const transform = context.drawElementImage?.(card, -width / 2, -height / 2, width, height);
        // Earlier implementations return a matrix instead of syncing geometry.
        const cssTransform = transform ? transform.toString() : "";
        if (card.style.transform !== cssTransform) card.style.transform = cssTransform;
      } catch {
        setMessage("描画に失敗しました。通常のHTMLプレビューへ切り替えました。");
        setSupport("failed");
      }
    };

    canvas.addEventListener("paint", paint);
    const observer = new ResizeObserver(([entry]) => {
      if (!entry || disposed) return;
      cssWidth = entry.contentRect.width;
      cssHeight = entry.contentRect.height;
      if (!cssWidth || !cssHeight) return;
      const pixels = entry.devicePixelContentBoxSize?.[0];
      const width = pixels?.inlineSize ?? Math.round(cssWidth * window.devicePixelRatio);
      const height = pixels?.blockSize ?? Math.round(cssHeight * window.devicePixelRatio);
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      card.style.width = `${Math.min(300, Math.max(160, cssWidth - 80))}px`;
      canvas.requestPaint?.();
    });
    const supportsPhysicalPixels = "devicePixelContentBoxSize" in ResizeObserverEntry.prototype;
    observer.observe(canvas, supportsPhysicalPixels ? { box: "device-pixel-content-box" } : {});
    const frame = requestAnimationFrame(() => canvas.requestPaint?.());

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("paint", paint);
    };
  }, [support, scale, angle]);

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (support !== "supported" || !canvas) return;
    setMessage("");
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          setMessage("画像を作成できませんでした。");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "html-in-canvas.png";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage("PNG画像を保存しました。");
      }, "image/png");
    } catch {
      setMessage("このブラウザでは画像を保存できませんでした。");
    }
  };

  const card = (
    <div
      ref={cardRef}
      {...{ drawable: "" }}
      className={`${styles.card} ${dark ? styles.darkCard : ""}`}
    >
      <span className={styles.eyebrow}>LIVE HTML</span>
      <h2>Hello, {name || "Canvas"}!</h2>
      <p>この文字を選択してみてください。下の入力欄とボタンも、本物のHTMLです。</p>
      <label className={styles.nameLabel}>
        表示する名前
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={24} />
      </label>
      <button className={styles.counter} type="button" onClick={() => setCount((value) => value + 1)}>
        クリックしてみる <strong>{count}</strong>
      </button>
    </div>
  );

  return (
    <div data-lab-styled="" className={styles.demo}>
      <PageTitle title="HTML-in-Canvas" />
      <div className={styles.intro}>
        <Link href="/labs">← Labs</Link>
        <p>HTMLをCanvasに描いて、そのまま操作する実験です。文字の選択や入力、ボタンのクリックを試してみてください。</p>
      </div>

      <p className={styles.status} role="status">
        <span className={support === "supported" ? styles.readyDot : styles.idleDot} aria-hidden="true" />
        {support === "checking" && "ブラウザの対応状況を確認しています…"}
        {support === "supported" && `対応しています · ネイティブ描画中${markup === "layoutsubtree" ? "（layoutsubtree形式）" : ""}`}
        {support === "unsupported" && "このブラウザは未対応です · 通常のHTMLプレビューを表示しています"}
        {support === "failed" && "描画できませんでした · 通常のHTMLプレビューを表示しています"}
      </p>

      {support === "unsupported" && (
        <details className={styles.diagnostics}>
          <summary>対応状況の詳細</summary>
          <ul>
            <li><code>content="drawable"</code>: {capabilities.content ? "対応" : "未対応"}</li>
            <li><code>layoutsubtree</code>（旧形式）: {capabilities.legacy ? "対応" : "未対応"}</li>
            <li><code>drawElementImage()</code>: {capabilities.draw ? "対応" : "未対応"}</li>
            <li><code>requestPaint()</code>: {capabilities.paint ? "対応" : "未対応"}</li>
          </ul>
          <p>ブラウザのバージョンだけでなく、APIが実際に有効かを確認しています。</p>
        </details>
      )}

      <div className={styles.playground}>
        <div className={styles.stage}>
          <span className={styles.stageLabel}>{support === "supported" ? "CANVAS / 2D" : "HTML PREVIEW"}</span>
          {support === "supported" ? (
            <canvas ref={canvasRef} {...(markup === "drawable" ? { content: "drawable" } : { layoutsubtree: "" })} className={styles.canvas}>
              {card}
            </canvas>
          ) : (
            <div className={styles.preview}>{card}</div>
          )}
        </div>

        <fieldset className={styles.controls}>
          <legend>描画を変えてみる</legend>
          <label>
            <span>拡大率 <output>{scale}%</output></span>
            <input type="range" min="60" max="120" value={scale} disabled={support !== "supported"}
              onChange={(event) => setScale(Number(event.target.value))} />
          </label>
          <label>
            <span>回転 <output>{angle}°</output></span>
            <input type="range" min="-20" max="20" value={angle} disabled={support !== "supported"}
              onChange={(event) => setAngle(Number(event.target.value))} />
          </label>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={dark} onChange={(event) => setDark(event.target.checked)} />
            カードをダークにする
          </label>
          <div className={styles.actions}>
            <button type="button" onClick={() => { setScale(100); setAngle(0); setDark(false); setName("Canvas"); setCount(0); setMessage(""); }}>
              リセット
            </button>
            <button type="button" disabled={support !== "supported"} onClick={saveImage}>PNGで保存</button>
          </div>
        </fieldset>
      </div>
      <p className={styles.message} role="status">{message}</p>

      <section className={styles.notes}>
        <h2>試すポイント</h2>
        <ul>
          <li>カードの文字を選択してコピーする。</li>
          <li>名前を入力し、Canvasの描画に反映されるか確認する。</li>
          <li>拡大・回転した状態でもボタンをクリックする。Tabキーでの移動も試せます。</li>
          <li>PNGで保存して、入力内容を含むCanvas全体を書き出す。</li>
        </ul>
        <p>APIが有効な対応Chromeでお試しください。旧形式のlayoutsubtreeにも対応しています。未対応の場合、HTMLプレビューでは入力とクリックのみ試せます。入力内容をサーバーへ送信する処理はありません。</p>
      </section>
      <details className={styles.code}>
        <summary>APIの最小構成を見る</summary>
        <pre><code>{EXAMPLE}</code></pre>
        <p>これは新形式の例です。このデモでは画面サイズに合わせた解像度調整と、拡大・回転を加えています。旧形式ではlayoutsubtree属性を使い、必要に応じて描画結果の変換行列をHTML側にも適用します。</p>
      </details>
      <p className={styles.sources}>
        参考：<a href="https://developer.chrome.com/blog/html-in-canvas" target="_blank" rel="noopener noreferrer">Chromeの紹介記事</a>
        {" · "}<a href="https://developer.chrome.com/docs/web-platform/html-in-canvas/2d?hl=en" target="_blank" rel="noopener noreferrer">2D描画ガイド</a>
        {" · "}<a href="https://developer.chrome.com/docs/web-platform/html-in-canvas/concepts?hl=en" target="_blank" rel="noopener noreferrer">仕様と対応判定</a>
        {" · "}<a href="https://developer.chrome.com/blog/html-in-canvas-ot-changes?hl=en" target="_blank" rel="noopener noreferrer">旧形式との互換性</a>
      </p>
    </div>
  );
}
