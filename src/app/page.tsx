"use client";

import { Link } from "react-aria-components";
import { Avatar } from "@/components/Avatar";

const links = [
  { href: "/posts", text: "Posts" },
  { href: "/works", text: "Works" },
  { href: "/skills", text: "Skills" },
  { href: "https://twitter.com/ryo_manba", text: "Twitter", external: true },
];

const Home = () => {
  return (
    <div className="flex flex-col justify-center items-center px-3 max-w-screen-lg mx-auto py-32">
      <div className="flex flex-col items-center md:flex-row md:gap-x-16 md:justify-between justify-center">
        <div className="text-center md:text-start">
          <h1 className="font-bold text-3xl">
            Hi there 👋
            <br />
            I&#x27;m Ryo Matsukawa
          </h1>
          <p className="leading-9 mt-6 text-xl">
            猫とワインが好きなソフトウェアエンジニア
            <br />
            サイボウズで働いています。42 Tokyo Alumni。
          </p>
          <nav>
            <ul className="flex font-medium text-blue-500 gap-x-3 pt-2 justify-center md:justify-start outline-none">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="underline hover:text-white hover:bg-blue-800 focus:bg-blue-800 focus:text-white"
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <Avatar />
      </div>
    </div>
  );
};

export default Home;
