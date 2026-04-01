"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MdFavorite } from "react-icons/md";

type Props = {
  slug: string;
};

const MAX_LIKES = 10;

function FloatingHeart({ id, onDone }: { id: number; onDone: (id: number) => void }) {
  const angle = Math.random() * 60 - 30;
  const distance = 30 + Math.random() * 30;
  const size = 10 + Math.random() * 8;

  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 800);
    return () => clearTimeout(timer);
  }, [id, onDone]);

  return (
    <span
      className="absolute pointer-events-none text-red-400"
      style={{
        fontSize: `${size}px`,
        left: "50%",
        top: "50%",
        animation: "float-heart 0.8s ease-out forwards",
        ["--angle" as string]: `${angle}deg`,
        ["--distance" as string]: `${distance}px`,
      }}
    >
      ♥
    </span>
  );
}

export function LikeButton({ slug }: Props) {
  const [count, setCount] = useState(0);
  const [myLikes, setMyLikes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBouncing, setIsBouncing] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<number[]>([]);
  const [showBurst, setShowBurst] = useState(false);
  const nextHeartId = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem(`likes:${slug}`);
    if (stored) {
      setMyLikes(Number.parseInt(stored, 10));
    }

    fetch(`/api/likes/${slug}`)
      .then((res) => res.json())
      .then((data) => setCount(data.count))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [slug]);

  const removeHeart = useCallback((id: number) => {
    setFloatingHearts((prev) => prev.filter((h) => h !== id));
  }, []);

  const handleLike = async () => {
    if (myLikes >= MAX_LIKES) return;

    const newMyLikes = myLikes + 1;
    setMyLikes(newMyLikes);
    setCount((prev) => prev + 1);
    localStorage.setItem(`likes:${slug}`, String(newMyLikes));

    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 300);

    if (newMyLikes >= MAX_LIKES) {
      // 10回目: 大量のハートを放出
      const burstIds = Array.from({ length: 12 }, () => nextHeartId.current++);
      setFloatingHearts((prev) => [...prev, ...burstIds]);
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    } else {
      const heartId = nextHeartId.current++;
      setFloatingHearts((prev) => [...prev, heartId]);
    }

    try {
      const res = await fetch(`/api/likes/${slug}`, { method: "POST" });
      const data = await res.json();
      setCount(data.count);
    } catch {
      // Optimistic update is already applied
    }
  };

  const fillPercent = myLikes / MAX_LIKES;
  const heartColor =
    myLikes === 0
      ? "text-gray-300"
      : fillPercent < 0.5
        ? "text-pink-300"
        : fillPercent < 1
          ? "text-red-400"
          : "text-red-500";

  return (
    <div className="flex items-center gap-3">
      <style>
        {`
				@keyframes float-heart {
					0% {
						transform: translate(-50%, -50%) rotate(0deg) scale(1);
						opacity: 1;
					}
					100% {
						transform: translate(
							calc(-50% + var(--distance) * sin(var(--angle))),
							calc(-50% - var(--distance))
						) rotate(var(--angle)) scale(0.5);
						opacity: 0;
					}
				}
				@keyframes bounce-heart {
					0% { transform: scale(1); }
					30% { transform: scale(1.3); }
					50% { transform: scale(0.9); }
					70% { transform: scale(1.1); }
					100% { transform: scale(1); }
				}
				@keyframes burst-ring {
					0% {
						transform: translate(-50%, -50%) scale(0.5);
						opacity: 0.8;
						border-width: 3px;
					}
					100% {
						transform: translate(-50%, -50%) scale(2.5);
						opacity: 0;
						border-width: 1px;
					}
				}
				`}
      </style>
      <div className="relative">
        <button
          type="button"
          onClick={handleLike}
          disabled={myLikes >= MAX_LIKES}
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
            myLikes >= MAX_LIKES
              ? "border-red-300 bg-red-50 cursor-default"
              : "border-gray-200 bg-white hover:border-red-200 hover:bg-red-50 active:scale-95"
          }`}
          style={isBouncing ? { animation: "bounce-heart 0.3s ease-out" } : undefined}
          aria-label={`いいね（${myLikes}/${MAX_LIKES}）`}
        >
          <MdFavorite
            className={`w-6 h-6 transition-colors ${heartColor}`}
            style={{
              filter:
                myLikes > 0 ? `drop-shadow(0 0 ${fillPercent * 4}px rgba(239,68,68,${fillPercent * 0.5}))` : undefined,
            }}
          />
        </button>
        {floatingHearts.map((id) => (
          <FloatingHeart key={id} id={id} onDone={removeHeart} />
        ))}
        {showBurst && (
          <>
            <span
              className="absolute left-1/2 top-1/2 rounded-full border-red-400 pointer-events-none"
              style={{ animation: "burst-ring 0.6s ease-out forwards" }}
            />
            <span
              className="absolute left-1/2 top-1/2 rounded-full border-pink-300 pointer-events-none"
              style={{ animation: "burst-ring 0.6s ease-out 0.1s forwards", opacity: 0 }}
            />
          </>
        )}
      </div>
      <span className="text-sm text-gray-600 tabular-nums font-medium">{isLoading ? "" : count.toLocaleString()}</span>
    </div>
  );
}
