export const TERMINAL_WIDTH = 480;
export const TERMINAL_HEIGHT = 620;
export const LOG_TOP = 318;
export const LOG_HEIGHT = 202;
export type TerminalView = "html" | "canvas";
export type NativeMode = "native" | "legacy" | "fallback";

export const MISSION_LOG = [
  "01｜通信確立。ここは第七前哨基地。作戦メモに、あなたの言葉で帰還までの計画を残してください。",
  "02｜金色のコアを三つ集めたら、中央のリアクターへ。仲間への引き継ぎには、場所と順番を日本語で記しておきましょう。",
  "03｜例えば「東側のコアを回収してから、中央で補給する」。入力欄でひらがなを入力し、漢字への変換も試してください。",
  "04｜このログの文章をドラッグして選択してみましょう。必要な部分をコピーして、作戦メモへ貼り付けられます。",
  "05｜端末はゲームの中にある立体です。端末の角度を変えてから、もう一度入力欄や文章を操作してみてください。",
  "06｜長い記録は、この領域だけをスクロールして読めます。端末の調査中は時間も敵も止まっています。",
  "07｜斥候は接近して機体を狙います。センチネルは距離を取り、弾を撃ってきます。遮蔽物の位置を確認してください。",
  "08｜ダッシュ中は短時間だけ攻撃を回避できます。パルスは周囲の敵をまとめて押し返す、緊急時の切り札です。",
  "09｜作戦メモは、表示を切り替えても共通です。普通のCanvasで同じ文字が見えても、その文字自体は入力欄にはなりません。",
  "10｜普通のCanvas側のスクロールは、ポインター位置を計算して描き直す専用処理です。文字選択や日本語変換の仕組みは含めていません。",
  "11｜最終ウェーブではガーディアンが出現します。コアの回収に加え、ガーディアンの撃破が脱出の条件になります。",
  "12｜記録の末尾に到達しました。お疲れさまでした。必要な文章を選択し、あなたの作戦メモを完成させてください。",
];

export function wrapTerminalText(text: string, width: number, measure: (text: string) => number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const character of Array.from(paragraph)) {
      if (line && measure(line + character) > width) {
        lines.push(line);
        line = "";
      }
      line += character;
    }
    lines.push(line);
  }
  return lines;
}

/** Do not take IME, text selection, or terminal keyboard events for game controls. */
export function ownsTextInput(event: {
  isComposing: boolean;
  keyCode: number;
  target: { tagName?: string; isContentEditable?: boolean; closest?: (selector: string) => unknown } | null;
}) {
  const target = event.target;
  return Boolean(
    event.isComposing ||
      event.keyCode === 229 ||
      target?.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName || "") ||
      target?.closest?.("[data-terminal-root]"),
  );
}

/** An intentionally ordinary Canvas 2D renderer: no HTML field or hidden input. */
export function paintCanvasTerminal(
  context: CanvasRenderingContext2D,
  state: { hp: number; wave: number; cores: number; note: string; scroll: number },
) {
  const text = (value: string, x: number, y: number, size = 18, color = "#edf8fc", weight = "normal") => {
    context.font = `${weight} ${size}px system-ui, sans-serif`;
    context.fillStyle = color;
    context.fillText(value, x, y);
  };
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = "#0e2433";
  context.fillRect(0, 0, TERMINAL_WIDTH, TERMINAL_HEIGHT);
  context.strokeStyle = "#57d4cf";
  context.lineWidth = 2;
  context.strokeRect(1, 1, TERMINAL_WIDTH - 2, TERMINAL_HEIGHT - 2);
  text("SYSTEM / OPERATIONS TERMINAL", 20, 35, 12, "#8af0e3", "bold");
  text("前哨基地 作戦端末", 20, 71, 26, "#edf8fc", "bold");
  text(`WAVE ${state.wave}/3   HULL ${state.hp}%   CORES ${state.cores}/3`, 20, 103, 15, "#a6c8d8");
  text("作戦メモ（日本語入力・変換）", 20, 143, 16);
  context.fillStyle = "#102b3b";
  context.fillRect(20, 152, 440, 96);
  context.strokeStyle = "#457182";
  context.lineWidth = 1;
  context.strokeRect(20.5, 152.5, 439, 95);
  context.font = "18px system-ui, sans-serif";
  const lines = wrapTerminalText(
    state.note || "例：東側のコアを回収してから、中央で補給する。",
    414,
    (value) => context.measureText(value).width,
  );
  context.save();
  context.beginPath();
  context.rect(21, 153, 438, 94);
  context.clip();
  lines.forEach((line, index) => text(line, 33, 180 + index * 27, 18, state.note ? "#edf8fc" : "#8aaab9"));
  context.restore();
  text("ピクセル表示：この面では入力・選択できません", 20, 270, 12, "#ffcc80");
  text("受信ログ / 選択・スクロール", 20, 308, 16);
  context.font = "18px system-ui, sans-serif";
  const entries = MISSION_LOG.map((entry) => wrapTerminalText(entry, 408, (value) => context.measureText(value).width));
  const contentHeight = entries.reduce((height, entry) => height + entry.length * 27 + 12, 24);
  const maxScroll = Math.max(0, contentHeight - LOG_HEIGHT);
  const scroll = Math.max(0, Math.min(maxScroll, state.scroll));
  context.fillStyle = "#091d2b";
  context.fillRect(20, LOG_TOP, 440, LOG_HEIGHT);
  context.save();
  context.beginPath();
  context.rect(21, LOG_TOP + 1, 438, LOG_HEIGHT - 2);
  context.clip();
  let y = LOG_TOP + 33 - scroll;
  for (const entry of entries) {
    for (const line of entry) {
      text(line, 33, y, 18, "#c5deea");
      y += 27;
    }
    y += 12;
  }
  context.restore();
  context.strokeStyle = "#345969";
  context.strokeRect(20.5, LOG_TOP + 0.5, 439, LOG_HEIGHT - 1);
  const thumb = Math.max(20, (LOG_HEIGHT * LOG_HEIGHT) / contentHeight);
  context.fillStyle = "#648e9e";
  context.fillRect(451, LOG_TOP + (maxScroll ? (scroll / maxScroll) * (LOG_HEIGHT - thumb) : 0), 5, thumb);
  text("ホイール・タッチで移動（JavaScriptで実装）", 20, 545, 12, "#8aaab9");
  context.fillStyle = "#8af0e3";
  context.fillRect(20, 560, 440, 38);
  text("メモを消去", 196, 585, 16, "#102331", "bold");
  return maxScroll;
}
