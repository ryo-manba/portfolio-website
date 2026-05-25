# おみくじインタラクション設計書

作成日: 2026-05-26

## 目的

トップページのプロフィール画像領域を、クリックで「振って結果を引く」おみくじインタラクションに置き換える。訪問者の初見インパクトを高め、サイトに遊び心を加える。

## 現状

- `src/app/page.tsx` の Hero セクションで `<Avatar />` を表示。
- `src/components/Avatar.tsx` は `/images/profile-image.webp`（金メダル画像）をボタンで包み、クリックで `animate-rotate-coin`（Y軸180°回転、0.5s）を再生するのみ。
- `public/assets/omikuji/` に6種類の結果カード画像が用意済み:
  - `daikichi.png`（大吉）
  - `chu-kichi.png`（中吉）
  - `sho-kichi.png`（小吉）
  - `kichi.png`（吉）
  - `kyo.png`（凶）
  - `daikyo.png`（大凶）
- 各画像は丸型・和柄背景・赤い札中央に漢字、約2MB の PNG。

## 要件

### ユーザー体験

1. **初期表示**: CSS で構築した「?」柄の未開封カード（既存6枚と同じ円形・配色）を表示。
2. **クリック**: カードが横振動するシェイクアニメーション（約0.6s）。
3. **結果表示**: シェイク終了の `onAnimationEnd` をトリガとして、6種類からランダム抽選した結果カード画像を `<Image>` に差し替え、約0.2s のフェードインで表示。シェイクとフェードは時間的に重ならず順次再生する。
4. **再クリック**: 何度でも引き直し可能。前結果から新結果へシェイク経由で遷移。
5. **テキストラベルなし**: カード画像中央の漢字（大吉等）のみで結果を表現。
6. **アクセシビリティ**:
   - `prefers-reduced-motion: reduce` 環境ではシェイクを skip し、即フェードのみ。
   - ボタンに適切な `aria-label` を付与（例: "おみくじを引く"、結果表示中は "もう一度引く"）。
   - 現在の結果はスクリーンリーダーにアナウンスされるよう `aria-live` 等で配慮（後述）。

### 抽選ロジック

伝統的な神社の出し方を参考に吉側へ重み付け：

| 結果 | 確率 |
|---|---|
| 大吉 | 30% |
| 中吉 | 20% |
| 小吉 | 20% |
| 吉 | 15% |
| 凶 | 10% |
| 大凶 | 5% |

`Math.random()` を累積分布関数に通して抽選。連続同結果は許容。

## アーキテクチャ

### コンポーネント構成

```
src/components/Omikuji.tsx        ← 新規。状態機械・抽選・描画を担う
src/components/Omikuji.stories.tsx ← 新規。Storybook 用
```

`Omikuji` は単一の Client Component。外部公開 API はなし（props 不要、自己完結）。

### 状態機械

```
       ┌──── click ────┐
       ▼               │
┌──────────┐    ┌─────────────┐
│   idle   │───▶│   shaking   │
└──────────┘    └─────────────┘
       ▲               │
       │   animation   │
       └─── end ───────┘
            (抽選 + 画像差替)
```

- `idle`: 何かしらのカード表示（初回は「?」、以降は前結果）。クリック受付。
- `shaking`: アニメーション中。クリック無効（連打防止）。`onAnimationEnd` で抽選→`idle`へ。

### データ

```ts
type OmikujiResult = "daikichi" | "chu-kichi" | "sho-kichi" | "kichi" | "kyo" | "daikyo";

const RESULTS: ReadonlyArray<{
  key: OmikujiResult;
  label: string;        // a11y 用（"大吉"等）
  src: string;          // "/assets/omikuji/daikichi.png" 等
  weight: number;       // 0-1 の確率
}> = [...];
```

抽選関数 `pickRandomOmikuji()` は累積分布から1件返す純粋関数。テストしやすい形にする。

### アニメーション

`tailwind.config.js` に `shake` keyframes を追加：

```js
keyframes: {
  rotateCoin: { ... }, // 既存維持
  shake: {
    "0%, 100%":   { transform: "translateX(0) rotate(0deg)" },
    "15%":        { transform: "translateX(-8px) rotate(-4deg)" },
    "30%":        { transform: "translateX(8px) rotate(4deg)" },
    "45%":        { transform: "translateX(-6px) rotate(-3deg)" },
    "60%":        { transform: "translateX(6px) rotate(3deg)" },
    "75%":        { transform: "translateX(-3px) rotate(-1deg)" },
  },
},
animation: {
  "rotate-coin": "rotateCoin 0.5s linear forwards",
  "shake-omikuji": "shake 0.6s ease-in-out",
},
```

`prefers-reduced-motion: reduce` の場合は `animation: none` で適用しない。Tailwind は標準で `motion-reduce:` バリアントを提供するため、`motion-reduce:animate-none` 等で対応する。

結果カードに切り替わる際の0.2s フェードインは、画像差替時にキー変更（`key={result.key}` を `<Image>` に渡す）+ `animate-fade-in` カスタム keyframes、または CSS transition で実装。

### 「?」未開封カード（CSS）

新規 PNG を追加せず、純粋に Tailwind で組む：

```tsx
<div className="
  h-40 w-40 md:h-72 md:w-72 rounded-full
  bg-[#f8efd9]                      // 生成り
  border-4 border-red-700
  flex items-center justify-center
  shadow-md
">
  <span className="text-red-700 font-serif text-6xl md:text-9xl font-bold">?</span>
</div>
```

色味は既存6枚の背景色・赤色に近づけて統一感を出す。具体的なHEXは実装時に画像から微調整。

## ファイル変更一覧

| 操作 | パス | 内容 |
|---|---|---|
| 新規 | `src/components/Omikuji.tsx` | 本機能のコンポーネント |
| 新規 | `src/components/Omikuji.stories.tsx` | Storybook |
| 編集 | `src/app/page.tsx` | `<Avatar />` → `<Omikuji />` |
| 編集 | `tailwind.config.js` | `shake` keyframes + `shake-omikuji` animation 追加 |
| 削除 | `src/components/Avatar.tsx` | 用途消滅 |
| 削除 | `src/components/Avatar.stories.tsx` | 用途消滅 |
| 削除 | `public/images/profile-image.webp` | 用途消滅 |

## テスト

`vitest` 既存セットアップを使用。

### ユニット
- `pickRandomOmikuji`: 確率分布が宣言通り（多数試行で各結果が許容誤差内）。
- `pickRandomOmikuji`: 戻り値が必ず6種類のいずれかである。
- 重みの合計が1.0であること（定数の sanity check）。

### コンポーネント
- 初期は「?」カードが描画される。
- クリックでボタンが `disabled`（または相当の連打防止）になる。
- アニメ完了後に結果カード画像が表示される。

## 非対象

- 結果のテキスト解説や運勢内容（カード画像中央の漢字のみ）。
- 結果の永続化（localStorage 等）・SNS シェア。
- 効果音（無音）。
- 結果ごとの紙吹雪等の追加演出。

## オープン質問

なし。すべての設計判断はユーザー承認済み。
