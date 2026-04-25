"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { PageTitle } from "@/components/PageTitle";
import { validateImageFile, type ImageValidationError } from "./validateImage";

const ORT_CDN = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js";
const MODEL_URL =
  "https://huggingface.co/onnxmodelzoo/mobilenetv2-7/resolve/main/mobilenetv2-7.onnx";
const LABELS_URL =
  "https://raw.githubusercontent.com/anishathalye/imagenet-simple-labels/master/imagenet-simple-labels.json";


const BASIC_EXAMPLE = `// C = 0.2 * A + B
const descriptor = { dataType: 'float32', shape: [2, 2] };
const context = await navigator.ml.createContext();
const builder = new MLGraphBuilder(context);

const constant = builder.constant(descriptor, new Float32Array(4).fill(0.2));
const A = builder.input('A', descriptor);
const B = builder.input('B', descriptor);
const C = builder.add(builder.mul(A, constant), B);

const graph = await builder.build({ 'C': C });`;

const ONNX_EXAMPLE = `const session = await ort.InferenceSession.create('./model.onnx', {
  executionProviders: [{
    name: 'webnn',
    deviceType: 'gpu',           // 'cpu' | 'gpu' | 'npu'
    powerPreference: 'default',  // 'default' | 'low-power' | 'high-performance'
  }],
});

const input = new ort.Tensor('float32', new Float32Array([1, 2, 3, 4]), [1, 4]);
const results = await session.run({ input });
console.log(results.output.data);`;

const preStyle = {
  backgroundColor: "#1e1e1e",
  color: "#d4d4d4",
  padding: "1em",
  borderRadius: "8px",
  overflow: "auto" as const,
  fontSize: "0.875em",
};

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b);
  return exps.map((e) => e / sum);
}

function preprocessImage(imageData: ImageData): Float32Array {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  const float32Data = new Float32Array(3 * pixelCount);
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  for (let i = 0; i < pixelCount; i++) {
    float32Data[pixelCount * 0 + i] =
      (data[i * 4 + 0] / 255.0 - mean[0]) / std[0];
    float32Data[pixelCount * 1 + i] =
      (data[i * 4 + 1] / 255.0 - mean[1]) / std[1];
    float32Data[pixelCount * 2 + i] =
      (data[i * 4 + 2] / 255.0 - mean[2]) / std[2];
  }
  return float32Data;
}

// biome-ignore lint/suspicious/noExplicitAny: ort is loaded from CDN as global
function getOrt(): any {
  // biome-ignore lint/suspicious/noExplicitAny: ort is loaded from CDN as global
  return (globalThis as any).ort;
}

export default function WebNNDemo() {
  const [supportStatus, setSupportStatus] = useState("");
  const [ortReady, setOrtReady] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [results, setResults] = useState<{ name: string; prob: number }[]>([]);
  const [status, setStatus] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: navigator.ml is not yet typed
    if ((navigator as any).ml) {
      setSupportStatus("supported");
    } else {
      setSupportStatus("unsupported");
    }
  }, []);

  // Object URL クリーンアップ（メモリリーク対策）
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleFile = async (file: File) => {
    const result = await validateImageFile(file);
    if (!result.ok) {
      const messages: Record<ImageValidationError, string> = {
        "too-large": "画像ファイルは 10MB 以下にしてください",
        "unsupported-mime": "JPEG/PNG/WebP/GIF のみサポートしています",
        "magic-byte-mismatch": "ファイルの中身が画像形式と一致しません",
      };
      setStatus(messages[result.error]);
      setResults([]);
      return;
    }
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResults([]);
    setStatus("");
  };

  const classify = async () => {
    if (!imageUrl || !canvasRef.current) return;
    const ort = getOrt();
    if (!ort) {
      setStatus("ONNX Runtime がまだ読み込まれていません");
      return;
    }

    setIsRunning(true);
    setResults([]);

    try {
      setStatus("モデルを読み込み中（初回は ~14MB ダウンロード）...");

      let session: InstanceType<typeof ort.InferenceSession>;
      let ep = "webnn";
      try {
        session = await ort.InferenceSession.create(MODEL_URL, {
          executionProviders: [{ name: "webnn", deviceType: "cpu" }],
        });
      } catch {
        ep = "wasm";
        session = await ort.InferenceSession.create(MODEL_URL, {
          executionProviders: ["wasm"],
        });
      }

      setStatus("画像を前処理中...");
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      canvas.width = 224;
      canvas.height = 224;

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("画像の読み込みに失敗"));
        img.src = imageUrl;
      });
      ctx.drawImage(img, 0, 0, 224, 224);
      const imageData = ctx.getImageData(0, 0, 224, 224);
      const tensorData = preprocessImage(imageData);
      const inputTensor = new ort.Tensor("float32", tensorData, [
        1, 3, 224, 224,
      ]);

      setStatus(`推論中（${ep.toUpperCase()} EP）...`);
      const start = performance.now();
      const feeds: Record<string, unknown> = {};
      feeds[session.inputNames[0]] = inputTensor;
      const output = await session.run(feeds);
      const elapsed = performance.now() - start;

      const outputData = Array.from(
        output[session.outputNames[0]].data as Float32Array,
      );
      const probs = softmax(outputData);

      let labels: string[];
      try {
        const res = await fetch(LABELS_URL);
        labels = await res.json();
      } catch {
        labels = probs.map((_, i) => `Class ${i}`);
      }

      const indexed = probs.map((p, i) => ({ name: labels[i], prob: p }));
      indexed.sort((a, b) => b.prob - a.prob);

      setResults(indexed.slice(0, 5));
      setStatus(`完了 — ${ep.toUpperCase()} EP, ${elapsed.toFixed(0)}ms`);
    } catch (error) {
      setStatus(`エラー: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <Script src={ORT_CDN} strategy="lazyOnload" onLoad={() => setOrtReady(true)} />
      <PageTitle title="WebNN API Demo" />
      <div
        style={{
          display: "block",
          maxWidth: "65ch",
          marginInlineStart: "auto",
          marginInlineEnd: "auto",
        }}
      >
        <div>
          <h2>概要</h2>
          <p>
            <a href="https://www.w3.org/TR/webnn/" target="_blank" rel="noopener noreferrer">
              Web Neural Network (WebNN) API
            </a>{" "}
            は、ブラウザ上でニューラルネットワークの推論をハードウェアアクセラレーション付きで実行するための
            W3C 標準仕様です。CPU・GPU・NPU（Neural Processing Unit）といったデバイスのネイティブ ML API
            に直接アクセスし、高速なオンデバイス推論を実現します。
          </p>
          <p>
            現在の仕様ステータスは <strong>Candidate Recommendation Draft</strong>（
            <a href="https://www.w3.org/news/2026/updated-candidate-recommendation-web-neural-network-webnn-api/" target="_blank" rel="noopener noreferrer">
              2026年1月22日更新
            </a>）で、2024年4月〜2026年1月の間に100以上の変更が加えられています。
          </p>

          <h2>主要インターフェース</h2>
          <p>
            WebNN API は以下のインターフェースで構成されます（
            <a href="https://www.w3.org/TR/webnn/" target="_blank" rel="noopener noreferrer">W3C 仕様</a>）。
          </p>
          <ul style={{ marginLeft: "1.5em", listStyleType: "disc" }}>
            <li><code>navigator.ml</code> — WebNN API のエントリーポイント（<a href="https://webnn.io/en/api-reference/webnn/navigatorml" target="_blank" rel="noopener noreferrer">参照</a>）</li>
            <li><code>MLContext</code> — 計算グラフの構築・実行を管理するコンテキスト</li>
            <li><code>MLGraphBuilder</code> — 計算グラフを構築するビルダー</li>
            <li><code>MLGraph</code> — コンパイル済みの不変な計算グラフ</li>
            <li><code>MLOperand</code> — グラフ内を流れるデータ（入力・定数・中間結果・出力）</li>
            <li><code>MLTensor</code> — デバイス固有のストレージ型（GPU/NPU メモリとの効率的なデータ共有）</li>
          </ul>

          <h2>サポートされるオペレーション</h2>
          <p>
            仕様には幅広いニューラルネットワーク演算が定義されています（
            <a href="https://www.w3.org/TR/webnn/#api-mlgraphbuilder" target="_blank" rel="noopener noreferrer">MLGraphBuilder 仕様</a>）。
          </p>
          <ul style={{ marginLeft: "1.5em", listStyleType: "disc" }}>
            <li><strong>畳み込み</strong> — <code>conv2d</code>, <code>convTranspose2d</code></li>
            <li><strong>行列演算</strong> — <code>matmul</code>, <code>gemm</code></li>
            <li><strong>活性化関数</strong> — <code>relu</code>, <code>sigmoid</code>, <code>softmax</code>, <code>gelu</code>, <code>tanh</code> 等</li>
            <li><strong>正規化</strong> — <code>batchNormalization</code>, <code>layerNormalization</code>, <code>instanceNormalization</code></li>
            <li><strong>プーリング</strong> — <code>averagePool2d</code>, <code>maxPool2d</code>, <code>l2Pool2d</code></li>
            <li><strong>RNN</strong> — <code>lstm</code>, <code>gru</code> とそのセルバリアント</li>
            <li><strong>テンソル操作</strong> — <code>concat</code>, <code>reshape</code>, <code>slice</code>, <code>transpose</code>, <code>gather</code>, <code>scatter</code></li>
            <li><strong>量子化</strong> — <code>quantizeLinear</code>, <code>dequantizeLinear</code></li>
          </ul>

          <h2>バックエンド構成</h2>
          <p>
            WebNN はプラットフォームごとにネイティブ ML API へルーティングします（
            <a href="https://learn.microsoft.com/en-us/windows/ai/directml/webnn-overview" target="_blank" rel="noopener noreferrer">Microsoft Learn</a>、
            <a href="https://blog.ziade.org/2025/11/21/why-webnn-is-the-future-of-ai-in-browsers/" target="_blank" rel="noopener noreferrer">Tarek Ziade</a>）。
          </p>
          <ul style={{ marginLeft: "1.5em", listStyleType: "disc" }}>
            <li><strong>Windows</strong> — ONNX Runtime / Windows ML（GPU・NPU）、TFLite/XNNPACK（CPU フォールバック）</li>
            <li><strong>macOS / iOS</strong> — Core ML、TFLite/XNNPACK（CPU フォールバック）</li>
            <li><strong>Android</strong> — NNAPI、TFLite/XNNPACK（CPU フォールバック）</li>
            <li><strong>Linux</strong> — TFLite/XNNPACK（CPU）</li>
          </ul>
          <p style={{ fontSize: "0.9em", color: "#999" }}>
            NPU は Intel Core Ultra（Intel AI Boost）や Qualcomm Hexagon（Copilot+ PC）で利用可能です（
            <a href="https://blogs.windows.com/windowsdeveloper/2024/08/29/directml-expands-npu-support-to-copilot-pcs-and-webnn/" target="_blank" rel="noopener noreferrer">Windows Developer Blog</a>）。
          </p>

          <h2>基本的な使い方</h2>
          <p>
            <code>navigator.ml.createContext()</code> でコンテキストを作成し、
            <code>MLGraphBuilder</code> で計算グラフを構築・コンパイル・実行します（
            <a href="https://webnn.io/en/learn/get-started/quickstart" target="_blank" rel="noopener noreferrer">Quickstart</a>）。
          </p>
          <pre style={preStyle}><code>{BASIC_EXAMPLE}</code></pre>

          <h2>ONNX Runtime Web との連携</h2>
          <p>
            <a href="https://onnxruntime.ai/docs/tutorials/web/ep-webnn.html" target="_blank" rel="noopener noreferrer">ONNX Runtime Web</a> では
            Execution Provider として <code>webnn</code> を指定することで、既存の ONNX モデルを WebNN バックエンドで実行できます。
          </p>
          <pre style={preStyle}><code>{ONNX_EXAMPLE}</code></pre>

          <h2>ブラウザ対応チェック</h2>
          <p>
            {supportStatus === "supported" && "✅ このブラウザは navigator.ml に対応しています"}
            {supportStatus === "unsupported" && "❌ このブラウザは navigator.ml に対応していません"}
            {supportStatus === "" && "チェック中..."}
          </p>
          <p style={{ fontSize: "0.9em", color: "#999" }}>
            <a href="https://www.neowin.net/news/google-promotes-chrome-146-to-the-beta-channel-with-webnn-support-sanitizer-api-and-more/" target="_blank" rel="noopener noreferrer">Chrome 146</a> で
            Origin Trial として利用可能（<a href="https://developer.chrome.com/blog/chrome-146-beta" target="_blank" rel="noopener noreferrer">Chrome 146 Beta</a>）。
            Edge も同時期にサポート予定。Firefox（<a href="https://github.com/mozilla/standards-positions/issues/1215" target="_blank" rel="noopener noreferrer">standards-positions #1215</a>）・
            Safari（<a href="https://github.com/WebKit/standards-positions/issues/486" target="_blank" rel="noopener noreferrer">standards-positions #486</a>）は実装未着手です（
            <a href="https://webstatus.dev/features/webnn" target="_blank" rel="noopener noreferrer">Web Platform Status</a>）。
          </p>

          <h2>ライブデモ — 画像分類</h2>
          <p>
            <a href="https://huggingface.co/onnxmodelzoo/mobilenetv2-7" target="_blank" rel="noopener noreferrer">MobileNetV2</a>{" "}
            (ONNX, ~14MB) を ONNX Runtime Web 経由で実行します。WebNN が利用可能なら WebNN EP、なければ WASM EP にフォールバックします。
          </p>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files[0];
              if (file) void handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #888",
              borderRadius: "8px",
              padding: "2em",
              textAlign: "center",
              cursor: "pointer",
              margin: "1em 0",
              backgroundColor: "#1e1e1e",
              color: "#999",
            }}
          >
            {imageUrl ? (
              // biome-ignore lint/a11y/useAltText: user-provided image preview
              <img src={imageUrl} style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "4px" }} />
            ) : (
              <p>画像をドラッグ＆ドロップ、またはクリックして選択</p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <button
            type="button"
            onClick={classify}
            disabled={isRunning || !imageUrl || !ortReady}
            style={{
              padding: "0.5em 1em",
              borderRadius: "4px",
              border: "1px solid #888",
              backgroundColor: !imageUrl || !ortReady ? "#555" : "#333",
              color: "#d4d4d4",
              cursor: !imageUrl || !ortReady ? "not-allowed" : "pointer",
            }}
          >
            {!ortReady ? "ONNX Runtime 読み込み中..." : isRunning ? "推論中..." : "分類を実行"}
          </button>

          {status && <p style={{ marginTop: "0.5em", fontSize: "0.9em" }}>{status}</p>}

          {results.length > 0 && (
            <div style={{ marginTop: "0.5em" }}>
              <p style={{ fontWeight: "bold", marginBottom: "0.5em" }}>
                この画像は「{results[0].name}」と判定されました（確信度: {(results[0].prob * 100).toFixed(1)}%）
              </p>
              {results.map((r) => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: "0.5em", marginBottom: "0.4em" }}>
                  <div
                    style={{
                      width: `${Math.max(r.prob * 300, 4)}px`,
                      height: "20px",
                      backgroundColor: "#4a9eff",
                      borderRadius: "3px",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "0.9em" }}>
                    {r.name} ({(r.prob * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          )}

          <h2>参考リンク</h2>
          <ul style={{ marginLeft: "1.5em", listStyleType: "disc" }}>
            <li><a href="https://www.w3.org/TR/webnn/" target="_blank" rel="noopener noreferrer">Web Neural Network API - W3C Candidate Recommendation Draft</a></li>
            <li><a href="https://github.com/webmachinelearning/webnn/blob/main/explainer.md" target="_blank" rel="noopener noreferrer">WebNN Explainer - GitHub</a></li>
            <li><a href="https://webnn.io/en/learn/introduction" target="_blank" rel="noopener noreferrer">Introduction to WebNN API - webnn.io</a></li>
            <li><a href="https://webnn.io/en/learn/get-started/quickstart" target="_blank" rel="noopener noreferrer">Quickstart - webnn.io</a></li>
            <li><a href="https://github.com/webmachinelearning/webnn-samples" target="_blank" rel="noopener noreferrer">WebNN Samples - GitHub</a></li>
            <li><a href="https://learn.microsoft.com/en-us/windows/ai/directml/webnn-overview" target="_blank" rel="noopener noreferrer">WebNN Overview - Microsoft Learn</a></li>
            <li><a href="https://onnxruntime.ai/docs/tutorials/web/ep-webnn.html" target="_blank" rel="noopener noreferrer">Using WebNN - ONNX Runtime</a></li>
            <li><a href="https://developer.chrome.com/blog/chrome-146-beta" target="_blank" rel="noopener noreferrer">Chrome 146 Beta - Chrome for Developers</a></li>
            <li><a href="https://blog.ziade.org/2025/11/21/why-webnn-is-the-future-of-ai-in-browsers/" target="_blank" rel="noopener noreferrer">WebNN is the future of browsers AI - Tarek Ziade</a></li>
            <li><a href="https://microsoft.github.io/webnn-developer-preview/" target="_blank" rel="noopener noreferrer">WebNN Developer Preview - Microsoft（Stable Diffusion, Whisper 等のデモ）</a></li>
            <li><a href="https://chromestatus.com/feature/5176273954144256" target="_blank" rel="noopener noreferrer">WebNN - Chrome Platform Status</a></li>
            <li><a href="https://github.com/webmachinelearning/awesome-webnn" target="_blank" rel="noopener noreferrer">Awesome WebNN - GitHub（リソース集）</a></li>
          </ul>
        </div>
      </div>
    </>
  );
}
