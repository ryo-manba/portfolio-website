"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Controller } from "./engine";
import type { Snapshot } from "./simulation";
import styles from "./game.module.css";

type DrawableCanvas = HTMLCanvasElement & { content?: string; layoutSubtree?: boolean; requestPaint?: () => void };
type DrawableContext = CanvasRenderingContext2D & {
  drawElementImage?: (element: Element, x: number, y: number, width: number, height: number) => DOMMatrix | undefined;
};
type PanelMode = "checking" | "native" | "legacy" | "fallback";
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

function paintFallback(context: CanvasRenderingContext2D, state: Snapshot) {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = "#0e2433";
  context.fillRect(0, 0, 768, 384);
  context.strokeStyle = "#57d4cf";
  context.lineWidth = 6;
  context.strokeRect(3, 3, 762, 378);
  context.fillStyle = "#8af0e3";
  context.font = "bold 26px system-ui";
  context.fillText("RECOVERY LINK", 40, 56);
  context.fillStyle = "#f2f8fb";
  context.font = "bold 48px system-ui";
  context.fillText(`WAVE ${state.wave} / 3`, 40, 133);
  context.font = "28px system-ui";
  context.fillText(`HULL ${state.hp}%     CORES ${state.cores}/3`, 40, 198);
  context.fillStyle = state.repair ? "#8af0e3" : "#44616b";
  context.fillRect(40, 252, 688, 84);
  context.fillStyle = "#102331";
  context.font = "bold 30px system-ui";
  context.fillText(state.repair ? "REPAIR +30 / 1 CHARGE" : "REPAIR USED", 66, 306);
}

export function NeonRelayGame() {
  const regionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<DrawableCanvas>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const snapshotRef = useRef<Snapshot>(INITIAL);
  const [snapshot, setSnapshot] = useState<Snapshot>(INITIAL);
  const [mode, setMode] = useState<PanelMode>("checking");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(0);
  const [best, setBest] = useState(0);
  const [notice, setNotice] = useState("");

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: A retry replaces the canvas nodes and requires new context listeners.
  useEffect(() => {
    const source = sourceRef.current;
    const panel = panelRef.current;
    if (!source || !panel) return;
    const context = source.getContext("2d") as DrawableContext | null;
    if (!context) {
      setMode("fallback");
      return;
    }
    const modern = source.content === "drawable";
    let native =
      (modern || source.layoutSubtree === true) &&
      typeof context.drawElementImage === "function" &&
      typeof source.requestPaint === "function";
    setMode(native ? (modern ? "native" : "legacy") : "fallback");
    const paint = () => {
      if (!native) return;
      try {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, 768, 384);
        const transform = context.drawElementImage?.(panel, 0, 0, 768, 384);
        const css = transform ? transform.toString() : "";
        if (panel.style.transform !== css) panel.style.transform = css;
        controllerRef.current?.refreshTexture();
      } catch {
        native = false;
        source.removeAttribute("content");
        source.removeAttribute("layoutsubtree");
        setMode("fallback");
        paintFallback(context, snapshotRef.current);
        controllerRef.current?.refreshTexture();
      }
    };
    source.addEventListener("paint", paint);
    const frame = requestAnimationFrame(() => {
      if (native) source.requestPaint?.();
      else paintFallback(context, snapshotRef.current);
    });
    return () => {
      cancelAnimationFrame(frame);
      source.removeEventListener("paint", paint);
    };
  }, [session]);

  useEffect(() => {
    if (mode !== "fallback") return;
    const context = sourceRef.current?.getContext("2d");
    if (context) {
      paintFallback(context, snapshot);
      controllerRef.current?.refreshTexture();
    }
  }, [mode, snapshot]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Recreate the renderer when the retry replaces its canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    const region = regionRef.current;
    if (!canvas || !source || !region) return;
    let cancelled = false;
    let controller: Controller | null = null;
    setLoaded(false);
    setError("");
    import("./engine")
      .then(({ createArena }) => {
        if (cancelled) return;
        controller = createArena({
          canvas,
          source,
          region,
          onChange: (value) => {
            snapshotRef.current = value;
            setSnapshot(value);
          },
          onError: setError,
        });
        controllerRef.current = controller;
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
          <span className={styles.eyebrow}>SECTOR 07 / BROWSER EXPERIMENT</span>
        </div>
        <div className={styles.titleRow}>
          <h1>
            NEON <span>RELAY</span>
          </h1>
          <p>
            回収しろ。生き延びろ。
            <br />
            3Dアリーナ・サバイバル
          </p>
        </div>
      </header>

      <div
        className={styles.viewport}
        ref={regionRef}
        tabIndex={-1}
        role="region"
        aria-label="Neon Relay 3Dゲーム。WASDで移動、Spaceで射撃、Shiftでダッシュ、Eでパルス。"
      >
        <canvas key={session} ref={canvasRef} className={styles.scene} aria-label="3Dアリーナ" />
        <div className={styles.hud}>
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

        <div className={styles.livePanel}>
          <span>{nativePanel ? "● LIVE HTML TEXTURE" : "● CANVAS 2D TEXTURE"}</span>
          <canvas
            key={`source-${session}`}
            ref={sourceRef}
            width="768"
            height="384"
            {...{ content: "drawable", layoutsubtree: "" }}
            aria-label="ゲーム内回復パネルの描画元"
          >
            <div ref={panelRef} {...{ drawable: "" }} className={styles.htmlPanel}>
              <span>RECOVERY LINK</span>
              <h2>WAVE {snapshot.wave} / 3</h2>
              <p>
                HULL {snapshot.hp}% <span>CORES {snapshot.cores}/3</span>
              </p>
              <button type="button" disabled={!canRepair} onClick={() => controllerRef.current?.repair()}>
                {snapshot.repair ? "応急修復 +30 / 1 CHARGE" : "REPAIR USED"}
              </button>
            </div>
          </canvas>
        </div>

        <div className={styles.mission}>
          <div>
            <span>MISSION {snapshot.boss ? "/ GUARDIAN ACTIVE" : "/ CORE RECOVERY"}</span>
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

        {playing && (
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

        {(ready || paused || finished || error) && (
          <div className={styles.scrim}>
            <section className={styles.menu} aria-label="ミッションメニュー">
              <span className={styles.eyebrow}>
                {error
                  ? "RENDERER OFFLINE"
                  : ready
                    ? "LINK ESTABLISHED"
                    : paused
                      ? "SIGNAL ON HOLD"
                      : snapshot.phase === "won"
                        ? "ALL CORES SECURED"
                        : "SIGNAL LOST"}
              </span>
              <h2>
                {error ? (
                  "描画を開始できません"
                ) : ready ? (
                  <>
                    THE LAST
                    <br />
                    <em>RELAY.</em>
                  </>
                ) : paused ? (
                  "一時停止"
                ) : snapshot.phase === "won" ? (
                  "MISSION CLEAR"
                ) : (
                  "MISSION FAILED"
                )}
              </h2>
              <p>
                {error ||
                  (ready
                    ? "ネオンの海に浮かぶ前哨基地。コアを3つ回収し、中央へ運べ。3ウェーブ目にはガーディアンが待ち受ける。"
                    : paused
                      ? "タブを離れると自動で停止します。準備ができたら再開してください。"
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
              <span className={styles.best}>LOCAL BEST {scoreText(best).padStart(5, "0")}</span>
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
          <button type="button" onClick={() => controllerRef.current?.rotateView()}>
            ↻ 視点を回す
          </button>
          <button type="button" disabled={!loaded} onClick={saveFrame}>
            PNG保存
          </button>
          <button type="button" disabled={!canRepair} onClick={() => controllerRef.current?.repair()}>
            ✚ 応急修復 {snapshot.repair ? "+30" : "使用済み"}
          </button>
        </div>
      </div>
      <div className={styles.guide}>
        <section>
          <span>01 / RECOVER</span>
          <h2>金色のコアを3つ集める</h2>
          <p>回収後は中央の光るリングへ。次のウェーブへ進むと耐久力が少し回復し、制限時間も延長されます。</p>
        </section>
        <section>
          <span>02 / SURVIVE</span>
          <h2>撃つ、かわす、遮る</h2>
          <p>
            射撃は近い敵へ自動照準。遮蔽物で弾を防ぎ、ダッシュで接触を回避。パルスは近くの敵をまとめて攻撃します。右ドラッグで視点も変えられます。
          </p>
        </section>
        <section>
          <span>03 / HTML-IN-CANVAS</span>
          <h2>HTMLが立体の端末になる</h2>
          <p>
            回復パネルのHTMLをCanvasに描き、3D空間のテクスチャへ貼っています。立体パネルの下部をクリックしても回復できます。
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
