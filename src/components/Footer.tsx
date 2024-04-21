"use client";

import { Link } from "react-aria-components";
import { memo } from "react";
import { TiSocialGithub, TiSocialLinkedin, TiSocialTwitter } from "react-icons/ti";

export const Footer = memo(function Footer() {
  return (
    <footer className="bg-[#F1F1F1] h-32 flex flex-col items-center justify-center">
      <div className="flex space-x-4 mb-2">
        <Link href="https://github.com/ryo-manba/portfolio-website" target="_blank" rel="noreferrer">
          <TiSocialGithub className="text-4xl hover:text-blue-600" aria-label="ポートフォリオサイトのリポジトリ" />
        </Link>
        <Link href="https://twitter.com/ryo_manba" target="_blank" rel="noreferrer">
          <TiSocialTwitter className="text-4xl hover:text-blue-600" aria-label="Twitterのプロフィール" />
        </Link>
        <Link href="https://www.linkedin.com/in/ryo-matsukawa-ba5276214/" target="_blank" rel="noreferrer">
          <TiSocialLinkedin className="text-4xl hover:text-blue-600" aria-label="LinkedInのプロフィール" />
        </Link>
      </div>

      <p className="text-sm">
        &copy; 2024{" "}
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
