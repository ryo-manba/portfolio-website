"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, memo } from "react";

type Props = {
  linkUrl: string;
  isActive: boolean;
  children: ReactNode;
};
const HeaderItem = memo(function HeaderItem({ linkUrl, isActive, children }: Props) {
  return (
    <Link
      href={linkUrl}
      className={`text-black text-lg hover:text-[#4B4B4B] ${isActive ? "border-b-2 border-black" : ""}`}
    >
      {children}
    </Link>
  );
});

export const Header = memo(function Header() {
  const pathName = usePathname();

  return (
    <>
      <header className="bg-[#F1F1F1] h-16">
        <nav className="flex justify-between items-center max-w-screen-xl mx-auto px-4 h-full">
          <div className="flex space-x-4">
            <HeaderItem linkUrl="/" isActive={"/" === pathName}>
              Home
            </HeaderItem>
            <HeaderItem linkUrl="/posts" isActive={"/posts" === pathName}>
              Posts
            </HeaderItem>
            <HeaderItem linkUrl="/works" isActive={"/works" === pathName}>
              Works
            </HeaderItem>
            <HeaderItem linkUrl="/skills" isActive={"/skills" === pathName}>
              Skills
            </HeaderItem>
          </div>
        </nav>
      </header>
    </>
  );
});
