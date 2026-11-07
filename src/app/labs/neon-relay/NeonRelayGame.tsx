"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Controller } from "./engine";
import styles from "./game.module.css";
import type { Snapshot } from "./simulation";

import type { DrawableCanvas } from "./html-texture";
import {
  MISSION_LOG,
  type NativeMode,
  TERMINAL_HEIGHT,
  TERMINAL_WIDTH,
  type TerminalView,
  paintCanvasTerminal,
} from "./terminal";

type PanelMode = "checking" | NativeMode;
const INITIAL: Snapshot = {
  phase: "ready",
  hp: 100,
  score: 0,
  wave: 1,
  cores: 0,
  time: 180,
  dash: 0,
  pulse: 0,
  repair: true,
  boss: false,
  kills: 0,
};
const scoreText = (value: number) => value.toLocaleString("en-US");
const timeText = (value: number) =>
  `${Math.floor(value / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(value % 60)
    .toString()
    .padStart(2, "0")}`;

export function NeonRelayGame() {
  const regionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<DrawableCanvas>(null);
  const sourceRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot>(INITIAL);
  const [mode, setMode] = useState<PanelMode>("checking");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(0);
  const [best, setBest] = useState(0);
  const [notice, setNotice] = useState("");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalView, setTerminalView] = useState<TerminalView>("html");
  const [note, setNote] = useState("");
  const [composing, setComposing] = useState(false);
  const [plainScroll, setPlainScroll] = useState(0);
  const maxPlainScrollRef = useRef(0);
  const terminalStateRef = useRef({ open: terminalOpen, view: terminalView });
  terminalStateRef.current = { open: terminalOpen, view: terminalView };

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("neon-relay-best"));
      if (Number.isFinite(saved) && saved > 0) setBest(Math.min(1_000_000_000, saved));
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  }, []);

  useEffect(() => {
    if (!["won", "lost"].includes(snapshot.phase) || snapshot.score <= best) return;
    setBest(snapshot.score);
    try {
      localStorage.setItem("neon-relay-best", String(snapshot.score));
    } catch {
      /* Optional local record. */
    }
  }, [snapshot.phase, snapshot.score, best]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry replaces the source canvas as well.
  useEffect(() => {
    const context = sourceRef.current?.getContext("2d");
    if (!context) return;
    maxPlainScrollRef.current = paintCanvasTerminal(context, {
      hp: snapshot.hp,
      wave: snapshot.wave,
      cores: snapshot.cores,
      note,
      scroll: plainScroll,
    });
    controllerRef.current?.refreshTexture();
  }, [snapshot.hp, snapshot.wave, snapshot.cores, note, plainScroll, session]);

  useEffect(() => {
    controllerRef.current?.setTerminal(terminalOpen, terminalView);
  }, [terminalOpen, terminalView]);

  useEffect(() => {
    // React 18 does not forward the native inert boolean attribute.
    if (panelRef.current)
      panelRef.current.inert = !(terminalOpen && terminalView === "html" && ["native", "legacy"].includes(mode));
  }, [terminalOpen, terminalView, mode]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Recreate the renderer when the retry replaces its canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    const region = regionRef.current;
    const terminal = panelRef.current;
    if (!canvas || !source || !region || !terminal) return;
    let cancelled = false;
    let controller: Controller | null = null;
    setLoaded(false);
    setError("");
    setMode("checking");
    import("./engine")
      .then(({ createArena }) => {
        if (cancelled) return;
        controller = createArena({
          canvas,
          source,
          terminal,
          region,
          onChange: (value) => {
            setSnapshot(value);
          },
          onError: setError,
          onNativeMode: (value, reason) => {
            setMode(value);
            if (value === "fallback") setTerminalView("canvas");
            if (reason) setNotice(reason);
          },
          onCanvasScroll: (delta) =>
            setPlainScroll((value) => Math.max(0, Math.min(maxPlainScrollRef.current, value + delta))),
          onCanvasClear: () => setNote(""),
          onCanvasInput: () =>
            setNotice("普通のCanvasの文字はピクセルです。入力・選択を試すにはHTML-in-Canvasへ切り替えてください。"),
        });
        controllerRef.current = controller;
        controller.setTerminal(terminalStateRef.current.open, terminalStateRef.current.view);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setError("3D描画を開始できませんでした。WebGL 2が有効なブラウザでお試しください。");
      });
    return () => {
      cancelled = true;
      controller?.dispose();
      controllerRef.current = null;
    };
  }, [session]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => undefined);
    else regionRef.current?.requestFullscreen?.().catch(() => undefined);
  };
  const ready = snapshot.phase === "ready";
  const playing = snapshot.phase === "playing";
  const paused = snapshot.phase === "paused";
  const finished = snapshot.phase === "won" || snapshot.phase === "lost";
  const nativePanel = mode === "native" || mode === "legacy";
  const canRepair = playing && snapshot.repair && snapshot.hp < 100;
  const hold = (key: string, active: boolean) => controllerRef.current?.hold(key, active);
  const saveFrame = () => {
    try {
      const image = controllerRef.current?.capture();
      if (!image) return;
      const link = document.createElement("a");
      link.href = image;
      link.download = "neon-relay.png";
      link.click();
      setNotice("3DフィールドのPNGを保存しました。");
    } catch {
      setNotice("この環境では画像を保存できませんでした。");
    }
  };
  const touchButton = (label: string, key: string, text: string, extraClass = "") => (
    <button
      type="button"
      aria-label={label}
      className={extraClass}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        hold(key, true);
      }}
      onPointerUp={() => hold(key, false)}
      onPointerCancel={() => hold(key, false)}
      onLostPointerCapture={() => hold(key, false)}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          hold(key, true);
        }
      }}
      onKeyUp={() => hold(key, false)}
      onBlur={() => hold(key, false)}
    >
      {text}
    </button>
  );

  return (
    <div data-lab-styled="" className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/labs">← LABS</Link>
        </div>
        <div className={styles.titleRow}>
          <h1>
            NEON <span>RELAY</span>
          </h1>
        </div>
      </header>

      <div
        className={styles.viewport}
        ref={regionRef}
        tabIndex={-1}
        role="region"
        aria-label="Neon Relay 3Dゲーム。WASDで移動、Spaceで射撃、Shiftでダッシュ、Eでパルス。"
      >
        <canvas
          key={session}
          ref={canvasRef}
          className={`${styles.scene} ${terminalOpen && terminalView === "html" ? styles.inspectScene : ""}`}
          {...{ content: "drawable", layoutsubtree: "" }}
          aria-label="3Dアリーナと作戦端末"
        >
          <div
            ref={panelRef}
            {...{ drawable: "", "data-terminal-root": "" }}
            aria-hidden={!(terminalOpen && terminalView === "html" && nativePanel)}
            style={{ pointerEvents: terminalOpen && terminalView === "html" && nativePanel ? "auto" : "none" }}
            className={styles.terminalElement}
          >
            <h2 className={styles.terminalTitle}>作戦端末</h2>
            <p className={styles.terminalMetrics}>
              WAVE {snapshot.wave}/3　 HULL {snapshot.hp}%　 CORES {snapshot.cores}/3
            </p>
            <label className={styles.memoLabel} htmlFor="operation-note">
              作戦メモ（日本語入力・変換）
            </label>
            <textarea
              id="operation-note"
              className={styles.memo}
              value={note}
              maxLength={400}
              placeholder="例：東側のコアを回収してから、中央で補給する。"
              onChange={(event) => setNote(event.target.value)}
              onCompositionStart={() => setComposing(true)}
              onCompositionEnd={() => setComposing(false)}
              spellCheck={false}
            />
            <span className={styles.inputState}>
              {composing ? "IME変換中…" : `${Array.from(note).length}文字 · ブラウザ標準の入力欄`}
            </span>
            <span className={styles.logLabel}>受信ログ / 選択・スクロール</span>
            <div
              className={styles.terminalLog}
              data-terminal-log=""
              // biome-ignore lint/a11y/noNoninteractiveTabindex: This named scrollable log needs keyboard scrolling.
              tabIndex={0}
              role="region"
              aria-label="受信ログ（文字選択・スクロール）"
            >
              {MISSION_LOG.map((entry) => (
                <p key={entry}>{entry}</p>
              ))}
            </div>
            <span className={styles.terminalHint}>ドラッグで文字を選択 · コピー · ホイールで移動</span>
            <button className={styles.clearMemo} type="button" onClick={() => setNote("")}>
              メモを消去
            </button>
          </div>
        </canvas>
        <canvas key={`source-${session}`} ref={sourceRef} width={TERMINAL_WIDTH} height={TERMINAL_HEIGHT} hidden />
        {terminalOpen && (
          <>
            <div className={styles.terminalBar}>
              <div role="group" aria-label="端末の描画方式">
                <button
                  type="button"
                  disabled={!nativePanel}
                  aria-pressed={terminalView === "html"}
                  onClick={() => setTerminalView("html")}
                >
                  HTML-in-Canvas
                </button>
                <button
                  type="button"
                  aria-pressed={terminalView === "canvas"}
                  onClick={() => setTerminalView("canvas")}
                >
                  普通のCanvas
                </button>
              </div>
              <button type="button" onClick={() => setTerminalOpen(false)}>
                閉じて戻る ×
              </button>
            </div>
            <p className={styles.inspectionHint}>
              {terminalView === "html"
                ? "メモに日本語を入力できます。ログは文字選択・コピー・スクロールができます。"
                : "同じメモを画像として表示します。入力・文字選択は未実装です。"}
              <span>端末を開いている間は戦闘が停止します。</span>
            </p>
          </>
        )}
        <div className={styles.hud} hidden={terminalOpen}>
          <div className={styles.health}>
            <span>
              HULL INTEGRITY <b>{snapshot.hp}%</b>
            </span>
            <meter min="0" max="100" value={snapshot.hp} aria-label="機体の耐久力" />
          </div>
          <div className={styles.wave}>
            <span>WAVE</span>
            <strong>
              0{snapshot.wave}
              <small> / 03</small>
            </strong>
          </div>
          <div className={styles.score}>
            <span>SCORE</span>
            <strong>{scoreText(snapshot.score).padStart(5, "0")}</strong>
          </div>
          <button
            type="button"
            aria-label={paused ? "ゲームを再開" : "ゲームを一時停止"}
            disabled={!playing && !paused}
            onClick={() => controllerRef.current?.togglePause()}
          >
            {paused ? "▶" : "Ⅱ"}
          </button>
          <button type="button" aria-label="全画面を切り替え" onClick={toggleFullscreen}>
            ⛶
          </button>
        </div>

        <div className={styles.mission} hidden={terminalOpen}>
          <div>
            <strong>
              {snapshot.cores < 3
                ? `コアを回収 ${snapshot.cores} / 3`
                : snapshot.boss
                  ? "ガーディアンを撃破せよ"
                  : "中央のリアクターへ戻れ"}
            </strong>
          </div>
          <div className={snapshot.time < 30 ? styles.urgent : ""}>
            <span>TIME LEFT</span>
            <strong>{timeText(snapshot.time)}</strong>
          </div>
        </div>

        {playing && !terminalOpen && (
          <div className={styles.touchControls}>
            <div className={styles.dpad}>
              {touchButton("上に移動", "KeyW", "↑", styles.up)}
              {touchButton("左に移動", "KeyA", "←", styles.left)}
              {touchButton("下に移動", "KeyS", "↓", styles.down)}
              {touchButton("右に移動", "KeyD", "→", styles.right)}
            </div>
            <div className={styles.touchActions}>
              {touchButton("射撃を続ける", "Space", "FIRE", styles.fire)}
              <button type="button" onClick={() => controllerRef.current?.dash()} disabled={snapshot.dash > 0}>
                DASH
              </button>
              <button type="button" onClick={() => controllerRef.current?.pulse()} disabled={snapshot.pulse > 0}>
                PULSE
              </button>
            </div>
          </div>
        )}

        {(!terminalOpen || error) && (ready || paused || finished || error) && (
          <div className={styles.scrim}>
            <section className={styles.menu} aria-label="ミッションメニュー">
              <h2>
                {error
                  ? "描画を開始できません"
                  : ready
                    ? "ゲーム開始"
                    : paused
                      ? "一時停止"
                      : snapshot.phase === "won"
                        ? "クリア"
                        : "ゲーム終了"}
              </h2>
              <p>
                {error ||
                  (ready
                    ? "コアを3つ集めて中央へ戻ります。3ウェーブ目はボスの撃破も必要です。"
                    : paused
                      ? "タブを離れると自動で一時停止します。"
                      : `SCORE ${scoreText(snapshot.score)} · ${snapshot.kills}機撃破`)}
              </p>
              {ready && (
                <div className={styles.menuKeys}>
                  <span>
                    <kbd>W A S D</kbd>移動
                  </span>
                  <span>
                    <kbd>SPACE</kbd>射撃
                  </span>
                  <span>
                    <kbd>SHIFT</kbd>ダッシュ
                  </span>
                  <span>
                    <kbd>E</kbd>パルス
                  </span>
                </div>
              )}
              <button
                type="button"
                className={styles.start}
                disabled={!loaded && !error}
                onClick={() =>
                  error
                    ? setSession((value) => value + 1)
                    : paused
                      ? controllerRef.current?.togglePause()
                      : controllerRef.current?.start()
                }
              >
                {error
                  ? "再読み込み"
                  : !loaded
                    ? "3Dフィールドを準備中…"
                    : paused
                      ? "ミッションを再開 →"
                      : ready
                        ? "ミッション開始 →"
                        : "もう一度挑戦 →"}
              </button>
              {ready && !error && (
                <button
                  className={styles.tryTerminal}
                  type="button"
                  disabled={!loaded}
                  onClick={() => setTerminalOpen(true)}
                >
                  先に3D端末を試す →
                </button>
              )}
              <span className={styles.best}>最高スコア {scoreText(best).padStart(5, "0")}</span>
            </section>
          </div>
        )}
      </div>

      <div className={styles.toolbar}>
        <div>
          <span>
            <kbd>WASD / ↑↓←→</kbd>移動
          </span>
          <span>
            <kbd>SPACE / 長押し</kbd>自動照準で射撃
          </span>
          <span>
            <kbd>SHIFT</kbd>ダッシュ {snapshot.dash > 0 ? `${snapshot.dash.toFixed(1)}s` : "READY"}
          </span>
          <span>
            <kbd>E</kbd>パルス {snapshot.pulse > 0 ? `${snapshot.pulse.toFixed(1)}s` : "READY"}
          </span>
          <span>
            <kbd>P / ESC</kbd>停止
          </span>
        </div>
        <div className={styles.toolbarActions}>
          <button type="button" disabled={!loaded || Boolean(error)} onClick={() => setTerminalOpen((value) => !value)}>
            {terminalOpen ? "ゲームへ戻る" : "3D端末を開く"}
          </button>
          <button type="button" onClick={() => controllerRef.current?.rotateView()}>
            {terminalOpen ? "↻ 端末の角度を変える" : "↻ 視点を回す"}
          </button>
          <button type="button" disabled={!loaded} onClick={saveFrame}>
            PNG保存
          </button>
          <button type="button" disabled={!canRepair} onClick={() => controllerRef.current?.repair()}>
            ✚ 応急修復 {snapshot.repair ? "+30" : "使用済み"}
          </button>
        </div>
      </div>
      <section className={styles.comparison} aria-label="HTML-in-Canvasと普通のCanvasの比較">
        <div>
          <h2>表示方式の比較</h2>
          <p>日本語入力、文字選択・コピー、スクロールの違いを比較できます。メモの内容は両方の表示で共通です。</p>
        </div>
        <table>
          <caption className={styles.accessibility}>このデモでの操作の違い</caption>
          <thead>
            <tr>
              <th scope="col">試す操作</th>
              <th scope="col">HTML-in-Canvas</th>
              <th scope="col">普通のCanvas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">日本語入力・変換</th>
              <td>HTMLの入力欄</td>
              <td>ピクセル表示のみ</td>
            </tr>
            <tr>
              <th scope="row">文字選択・コピー</th>
              <td>ブラウザ標準</td>
              <td>未実装</td>
            </tr>
            <tr>
              <th scope="row">ログのスクロール</th>
              <td>HTMLのスクロール領域</td>
              <td>JavaScriptで実装</td>
            </tr>
            <tr>
              <th scope="row">端末の角度変更</th>
              <td>操作位置も3Dに追従</td>
              <td>クリック位置を個別に計算</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.comparisonNote}>
          普通のCanvasで入力・文字選択を行うには、別途実装が必要です。メモはサーバーに送信せず、ページを閉じると消えます。
        </p>
        {mode === "legacy" && (
          <p className={styles.comparisonNote}>
            旧APIの互換処理として、ホイール操作をHTMLのスクロール領域へ転送しています。
          </p>
        )}
        {!nativePanel && mode !== "checking" && (
          <p role="status" className={styles.unsupported}>
            HTML-in-Canvasに未対応のため、普通のCanvas版を表示しています。HTML版は対応Chromeで利用できます。
          </p>
        )}
      </section>
      <div className={styles.guide}>
        <section>
          <h2>コアの回収</h2>
          <p>回収後は中央の光るリングへ。次のウェーブへ進むと耐久力が少し回復し、制限時間も延長されます。</p>
        </section>
        <section>
          <h2>戦闘操作</h2>
          <p>
            射撃は近い敵へ自動照準。遮蔽物で弾を防ぎ、ダッシュで接触を回避。パルスは近くの敵をまとめて攻撃します。右ドラッグで視点も変えられます。
          </p>
        </section>
        <section>
          <h2>3D端末</h2>
          <p>
            HTMLの入力欄とログをWebGL
            Canvasの中に置き、3Dの端末へ描画。角度を変えても、クリックや文字選択の位置が端末に追従します。
          </p>
        </section>
      </div>
      <footer className={styles.footer}>
        <span>
          {mode === "checking"
            ? "APIを確認中"
            : nativePanel
              ? `HTML-in-Canvas 有効${mode === "legacy" ? " / layoutsubtree" : ""}`
              : "HTML-in-Canvas未対応 / 通常のCanvas 2Dで表示"}{" "}
          · Three.js / WebGL 2
        </span>
        <Link href="/labs/html-in-canvas">基本のHTML-in-Canvasデモ →</Link>
      </footer>
      <p className={styles.notice} role="status">
        {notice}
      </p>
      <p className={styles.accessibility} aria-live="polite">
        {finished
          ? snapshot.phase === "won"
            ? `ミッションクリア。スコア${snapshot.score}。`
            : `ミッション失敗。スコア${snapshot.score}。`
          : ""}
      </p>
    </div>
  );
}
