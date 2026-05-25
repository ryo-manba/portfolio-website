"use client";

import Image from "next/image";
import { useState } from "react";
import { type OmikujiCard, pickRandomOmikuji } from "./omikuji";

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

  const handleClick = () => {
    if (state.phase === "shaking") return;
    const nextCard = pickRandomOmikuji();

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

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      className={`h-40 w-40 md:h-72 md:w-72 order-first md:order-last mb-10 ${
        isShaking ? "animate-shake-omikuji" : ""
      }`}
    >
      {visibleCard ? (
        <Image
          key={visibleCard.key}
          src={visibleCard.src}
          alt={visibleCard.label}
          width={1500}
          height={1500}
          className="animate-fade-in"
        />
      ) : (
        <ClosedCard />
      )}
    </button>
  );
};
