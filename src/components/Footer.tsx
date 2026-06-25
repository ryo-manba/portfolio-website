"use client";

import { Link } from "react-aria-components";
import { memo } from "react";
import { TiSocialGithub, TiSocialLinkedin } from "react-icons/ti";
import { FaXTwitter } from "react-icons/fa6";

export const Footer = memo(function Footer() {
  return (
    <footer className="bg-[#F1F1F1] h-32 flex flex-col items-center justify-center">
      <div className="flex space-x-4 mb-2">
        <Link href="https://github.com/ryo-manba/portfolio-website" target="_blank" rel="noreferrer">
          <TiSocialGithub className="text-4xl hover:text-blue-600" aria-label="ポートフォリオサイトのリポジトリ" />
        </Link>
        <Link href="https://x.com/ryo_manba" target="_blank" rel="noreferrer">
          <FaXTwitter className="text-3xl hover:text-blue-600" aria-label="Xのプロフィール" />
        </Link>
        <Link href="https://www.linkedin.com/in/ryo-matsukawa-ba5276214/" target="_blank" rel="noreferrer">
          <TiSocialLinkedin className="text-4xl hover:text-blue-600" aria-label="LinkedInのプロフィール" />
        </Link>
      </div>

      <p className="text-sm">
        &copy; 2024 - present{" "}
        <Link
          className="font-semibold hover:text-blue-600"
          href="https://github.com/ryo-manba"
          target="_blank"
          rel="noreferrer"
        >
          ryo-manba
        </Link>
        . App icon by{" "}
        <Link className="font-semibold hover:text-blue-600" href="https://icons8.jp/" target="_blank" rel="noreferrer">
          icons8
        </Link>
        .
      </p>
    </footer>
  );
});
