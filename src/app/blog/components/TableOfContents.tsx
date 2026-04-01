"use client";

import { useEffect, useRef, useState } from "react";
import type { TocItem } from "../utils/extractHeadings";

type Props = {
  headings: TocItem[];
};

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const listRef = useRef<HTMLUListElement>(null);
  const [lineStyle, setLineStyle] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" },
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to recalculate line position when headings change
  useEffect(() => {
    if (!listRef.current) return;
    const dots = listRef.current.querySelectorAll<HTMLElement>("[data-dot]");
    if (dots.length < 2) return;

    const listRect = listRef.current.getBoundingClientRect();
    const firstDot = dots[0].getBoundingClientRect();
    const lastDot = dots[dots.length - 1].getBoundingClientRect();

    const top = firstDot.top - listRect.top + firstDot.height / 2;
    const bottom = lastDot.top - listRect.top + lastDot.height / 2;

    setLineStyle({ top, height: bottom - top });
  }, [headings.length]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="目次"
      className="w-64 rounded-lg p-4"
      style={{ backgroundColor: "#F1F1F1" }}
    >
      <h2 className="text-base font-bold text-gray-800 mb-4">目次</h2>
      <ul ref={listRef} className="relative">
        <div
          className="absolute left-[5px] w-0.5 bg-blue-200"
          style={{ top: lineStyle.top, height: lineStyle.height }}
        />
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const isTopLevel = heading.level <= 2;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`flex items-start gap-2.5 transition-colors leading-snug ${
                  isTopLevel ? "py-2 text-sm font-semibold" : "py-1 pl-5 text-xs"
                } ${
                  isActive
                    ? "text-blue-700"
                    : isTopLevel
                      ? "text-gray-700 hover:text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span
                  data-dot
                  className={`rounded-full shrink-0 relative z-10 mt-1.5 ${isTopLevel ? "w-3 h-3" : "w-2 h-2"} ${
                    isActive ? "bg-blue-600" : "bg-blue-400"
                  }`}
                />
                <span className="flex-1">{heading.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
