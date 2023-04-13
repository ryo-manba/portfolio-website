import { memo, ReactNode } from 'react';
import Link from 'next/link';

type Props = {
  linkUrl: string;
  children: ReactNode;
};

const HeaderItem = memo(function HeaderItem({ linkUrl, children }: Props) {
  return (
    <>
      <Link href={linkUrl} legacyBehavior>
        <a className="text-black text-lg hover:text-[#4B4B4B]">{children}</a>
      </Link>
    </>
  );
});

export const Header = memo(function Header() {
  return (
    <>
      <header className="bg-[#D9D9D9] h-16">
        <nav className="flex justify-between items-center max-w-screen-xl mx-auto px-4 h-full">
          <div className="flex space-x-4">
            <HeaderItem linkUrl="/">Home</HeaderItem>
            <HeaderItem linkUrl="/posts">Posts</HeaderItem>
            <HeaderItem linkUrl="/works">Works</HeaderItem>
            <HeaderItem linkUrl="/profile">Profile</HeaderItem>
          </div>
        </nav>
      </header>
    </>
  );
});
