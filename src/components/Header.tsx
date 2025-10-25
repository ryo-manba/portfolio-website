"use client";

import { Link } from "react-aria-components";
import { usePathname } from "next/navigation";
import { memo } from "react";

const headerItem = [
  { href: "/", text: "Home" },
  { href: "/posts", text: "Posts" },
  { href: "/works", text: "Works" },
  { href: "/skills", text: "Skills" },
  { href: "/labs", text: "Labs" },
];

export const Header = memo(function Header() {
  const pathName = usePathname();
  return (
    <>
      <header className="bg-[#F1F1F1] h-16">
        <nav className="flex justify-between items-center max-w-screen-xl mx-auto px-4 h-full">
          <div className="flex space-x-4 mx-2">
            <ul>
              {headerItem.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-black text-lg px-2 py-1 rounded-md hover:bg-blue-600 hover:text-white focus-visible:bg-blue-600 focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-50 ring-offset-2 current:outline-none current:underline current:underline-offset-4 decoration-wavy outline-offset-2"
                    aria-current={item.href === pathName ? "page" : undefined}
                  >
                    {item.text}
                  </Link>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
});
