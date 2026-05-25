"use client";

import Image from "next/image";
import { useState } from "react";
import { type OmikujiCard, pickRandomOmikuji } from "./omikuji-utils";

type State =
  | { phase: "initial" }
  | { phase: "shaking"; nextCard: OmikujiCard; previousCard: OmikujiCard | null }
  | { phase: "revealed"; card: OmikujiCard };

const ClosedCard = () => (
  <div
    className="
      h-40 w-40 md:h-72 md:w-72 rounded-full
      bg-[#f8efd9] border-4 border-red-700
      flex items-center justify-center shadow-md
    "
  >
    <span className="text-red-700 font-serif text-6xl md:text-9xl font-bold select-none">?</span>
  </div>
);

const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const Omikuji = () => {
  const [state, setState] = useState<State>({ phase: "initial" });
  const [drawCount, setDrawCount] = useState(0);

  const handleClick = () => {
    if (state.phase === "shaking") return;
    const nextCard = pickRandomOmikuji();
    setDrawCount((c) => c + 1);

    if (prefersReducedMotion()) {
      setState({ phase: "revealed", card: nextCard });
      return;
    }

    const previousCard = state.phase === "revealed" ? state.card : null;
    setState({ phase: "shaking", nextCard, previousCard });
  };

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLButtonElement>) => {
    if (state.phase !== "shaking") return;
    if (e.animationName !== "shake") return;
    setState({ phase: "revealed", card: state.nextCard });
  };

  const isShaking = state.phase === "shaking";
  const visibleCard =
    state.phase === "initial"
      ? null
      : state.phase === "shaking"
        ? state.previousCard
        : state.card;

  const ariaLabel = state.phase === "initial" ? "おみくじを引く" : "もう一度おみくじを引く";

  const baseClassName = "h-40 w-40 md:h-72 md:w-72 order-first md:order-last mb-10";

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-busy={isShaking}
        onClick={handleClick}
        onAnimationEnd={handleAnimationEnd}
        className={isShaking ? `${baseClassName} animate-shake-omikuji` : baseClassName}
      >
        {visibleCard ? (
          <Image
            key={`${visibleCard.key}-${drawCount}`}
            src={visibleCard.src}
            alt={visibleCard.label}
            width={1500}
            height={1500}
            sizes="(max-width: 768px) 160px, 288px"
            className="animate-fade-in"
          />
        ) : (
          <ClosedCard />
        )}
      </button>
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {state.phase === "revealed" ? state.card.label : ""}
      </span>
    </>
  );
};
