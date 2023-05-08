import { memo } from 'react';
import {
  TiSocialLinkedin,
  TiSocialGithub,
  TiSocialTwitter,
} from 'react-icons/ti';

export const Footer = memo(function Footer() {
  return (
    <footer className="bg-[#D9D9D9] h-32 flex flex-col items-center justify-center">
      <div className="flex space-x-4 mb-2">
        <a href="https://github.com/ryo-manba" target="_blank" rel="noreferrer">
          <TiSocialGithub
            className="text-4xl"
            aria-label="Link: GitHubのプロフィール"
          />
        </a>
        <a
          href="https://twitter.com/ryo_manba"
          target="_blank"
          rel="noreferrer"
        >
          <TiSocialTwitter
            className="text-4xl"
            aria-label="Link: Twitterのプロフィール"
          />
        </a>
        <a
          href="https://www.linkedin.com/in/ryo-matsukawa-ba5276214/"
          target="_blank"
          rel="noreferrer"
        >
          <TiSocialLinkedin
            className="text-4xl"
            aria-label="Link: LinkedInのプロフィール"
          />
        </a>
      </div>

      <p className="text-sm">
        &copy; 2023{' '}
        <a
          className="font-semibold"
          href="https://github.com/ryo-manba"
          target="_blank"
          rel="noreferrer"
        >
          ryo-manba
        </a>
        . App icon by{' '}
        <a
          className="font-semibold"
          href="https://icons8.jp/"
          target="_blank"
          rel="noreferrer"
        >
          icons8
        </a>
        .
      </p>
    </footer>
  );
});
