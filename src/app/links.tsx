"use client";

import { Link } from "react-aria-components";

const links = [
  { href: "/posts", text: "Posts" },
  { href: "/works", text: "Works" },
  { href: "/skills", text: "Skills" },
  { href: "https://twitter.com/ryo_manba", text: "Twitter", external: true },
];

export const Links = () => {
  return (
    <nav>
      <ul className="flex font-medium text-blue-500 gap-x-3 pt-2 justify-center md:justify-start outline-none">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="underline hover:text-white hover:bg-blue-800 focus:bg-blue-800 focus:text-white text-xl flex gap-1"
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
            >
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
