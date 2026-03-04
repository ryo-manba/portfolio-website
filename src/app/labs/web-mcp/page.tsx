"use client";

import { useState, useEffect } from "react";
import { PageTitle } from "@/components/PageTitle";

const DECLARATIVE_EXAMPLE = `<form toolname="search_products"
      tooldescription="Search for products by name or category"
      toolautosubmit>
  <input type="text"
         name="query"
         toolparamtitle="Search Query"
         toolparamdescription="The search term to find products" />
  <select name="category"
          toolparamtitle="Category"
          toolparamdescription="Product category to filter by">
    <option value="electronics">Electronics</option>
    <option value="books">Books</option>
    <option value="clothing">Clothing</option>
  </select>
  <button type="submit">Search</button>
</form>`;

const IMPERATIVE_EXAMPLE = `await navigator.modelContext.registerTool({
  name: "get_weather",
  description: "Get the current weather for a given location",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "City name or zip code",
      },
      units: {
        type: "string",
        enum: ["celsius", "fahrenheit"],
        description: "Temperature units",
      },
    },
    required: ["location"],
  },
  execute: async ({ location, units = "celsius" }) => {
    const response = await fetch(
      \`/api/weather?location=\${location}&units=\${units}\`
    );
    return await response.json();
  },
});`;

export default function WebMCPDemo() {
  const [supportStatus, setSupportStatus] = useState("");

  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: navigator.modelContext is not yet typed
    if ((navigator as any).modelContext) {
      setSupportStatus("✅ このブラウザは navigator.modelContext に対応しています");
    } else {
      setSupportStatus("❌ このブラウザは navigator.modelContext に対応していません");
    }
  }, []);

  return (
    <>
      <PageTitle title="Web MCP Demo" />
      <div style={{ display: "block", maxWidth: "65ch", marginInlineStart: "auto", marginInlineEnd: "auto" }}>
        <div>
          <h2>概要</h2>
          <p>
            Web MCP は Chrome が提案するウェブ標準で、ウェブサイトのアクション（検索・予約など）をツールとして公開し、AI エージェントが発見・実行できるようにします。
            ツール定義には Declarative API（HTML 属性）と Imperative API（JavaScript）の 2 つがあります。
          </p>

          <h2>Declarative API</h2>
          <p>
            <code>&lt;form&gt;</code> に属性を追加するだけでツールを定義できます。
            なお、Declarative API は <a href="https://webmachinelearning.github.io/webmcp/#declarative-api" target="_blank" rel="noopener noreferrer">W3C 仕様</a>ではまだ TODO の状態で、属性名は <a href="https://github.com/webmachinelearning/webmcp/pull/76" target="_blank" rel="noopener noreferrer">Explainer ドラフト (PR #76)</a> に基づいています。
          </p>
          <ul style={{ marginLeft: "1.5em", listStyleType: "disc" }}>
            <li><code>toolname</code> — ツール名</li>
            <li><code>tooldescription</code> — ツールの説明</li>
            <li><code>toolautosubmit</code> — エージェントによる自動送信を許可</li>
            <li><code>toolparamtitle</code> — パラメータの表示名</li>
            <li><code>toolparamdescription</code> — パラメータの説明</li>
          </ul>
          <pre style={{ backgroundColor: "#1e1e1e", color: "#d4d4d4", padding: "1em", borderRadius: "8px", overflow: "auto", fontSize: "0.875em" }}>
            <code>{DECLARATIVE_EXAMPLE}</code>
          </pre>

          <h2>Imperative API</h2>
          <p>
            <a href="https://webmachinelearning.github.io/webmcp/#dom-modelcontext-registertool" target="_blank" rel="noopener noreferrer"><code>navigator.modelContext.registerTool()</code></a> で動的にツールを登録できます。
            プロパティ名は <a href="https://webmachinelearning.github.io/webmcp/#dictdef-modelcontexttool" target="_blank" rel="noopener noreferrer">W3C 仕様ドラフト</a>に基づいています。
          </p>
          <ul style={{ marginLeft: "1.5em", listStyleType: "disc" }}>
            <li><code>name</code> — ツールの一意な識別子</li>
            <li><code>description</code> — ツールの機能の自然言語による説明</li>
            <li><code>inputSchema</code> — 入力パラメータの JSON Schema 定義</li>
            <li><code>execute</code> — ツール呼び出し時に実行されるコールバック関数（非同期可）</li>
            <li><code>annotations</code> — ツールの振る舞いに関するオプションのメタデータ（例: <code>readOnlyHint</code>）</li>
          </ul>
          <pre style={{ backgroundColor: "#1e1e1e", color: "#d4d4d4", padding: "1em", borderRadius: "8px", overflow: "auto", fontSize: "0.875em" }}>
            <code>{IMPERATIVE_EXAMPLE}</code>
          </pre>

          <h2>ブラウザ対応チェック</h2>
          <p>{supportStatus || "チェック中..."}</p>

          <h2>このサイトでの実装</h2>
          <p>
            ルートレイアウトに非表示の Declarative API フォームを配置し、AI エージェントが <code>search_site</code> ツールとしてサイト内検索を実行できるようにしています。
          </p>
          <form
            action="/search"
            method="get"
            toolname="search_site_demo"
            tooldescription="ポートフォリオサイト内のブログ記事やプロジェクトをキーワードで検索します"
            toolautosubmit=""
            style={{
              display: "flex",
              gap: "0.5em",
              alignItems: "center",
              margin: "1em 0",
              padding: "1em",
              border: "1px solid #555",
              borderRadius: "8px",
            }}
          >
            <input
              type="text"
              name="q"
              placeholder="例: React, TypeScript, Pong"
              toolparamtitle="検索キーワード"
              toolparamdescription="検索したいキーワード"
              style={{
                flex: 1,
                padding: "0.5em",
                borderRadius: "4px",
                border: "1px solid #888",
                backgroundColor: "#1e1e1e",
                color: "#d4d4d4",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.5em 1em",
                borderRadius: "4px",
                border: "1px solid #888",
                backgroundColor: "#333",
                color: "#d4d4d4",
                cursor: "pointer",
              }}
            >
              検索
            </button>
          </form>

          <h2>参考リンク</h2>
          <ul style={{ marginLeft: "1.5em", listStyleType: "disc" }}>
            <li>
              <a href="https://github.com/webmachinelearning/webmcp/blob/main/README.md" target="_blank" rel="noopener noreferrer">
                WebMCP - GitHub
              </a>
            </li>
            <li>
              <a href="https://webmachinelearning.github.io/webmcp/" target="_blank" rel="noopener noreferrer">
                WebMCP - Draft Community Group Report, 3 March 2026
              </a>
            </li>
            <li>
              <a href="https://developer.chrome.com/blog/webmcp-epp?hl=ja" target="_blank" rel="noopener noreferrer">
                WebMCP Early Preview - Chrome for Developers
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
