'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const PROFILE_IMAGE_PATH = '/images/profile-image.webp';
const PROFILE_IMAGE_PATH2 = '/images/profile-image2.webp';

const Home = () => {
  const [imageSrc, setImageSrc] = useState(PROFILE_IMAGE_PATH);
  const [animateRotate, setAnimateRotate] = useState(false);
  const toggleImage = () => {
    setAnimateRotate(true);
    setImageSrc((prevSrc) =>
      prevSrc === PROFILE_IMAGE_PATH ? PROFILE_IMAGE_PATH2 : PROFILE_IMAGE_PATH,
    );
  };

  const onAnimationEnd = () => {
    setAnimateRotate(false);
  };

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
            <ul className="flex font-medium text-[#4B5563] gap-x-3 pt-2 justify-center md:justify-start">
              <li className="hover:text-[#1F2937] underline">
                <Link href="/posts">Posts</Link>
              </li>
              <li className="hover:text-[#1F2937] underline">
                <Link href="/works">Works</Link>
              </li>
              <li className="hover:text-[#1F2937] underline">
                <Link href="/skills">Skills</Link>
              </li>
              <li className="hover:text-[#1F2937] underline">
                <a
                  href="https://twitter.com/ryo_manba"
                  target="_blank"
                  rel="noreferrer"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div
          className="h-40 w-40 md:h-72 md:w-72 order-first md:order-last mb-10"
          onClick={toggleImage}
        >
          <Image
            alt="Avatar image"
            src={imageSrc}
            loading="lazy"
            width={1500}
            height={1500}
            className={animateRotate ? 'animate-rotate-coin' : ''}
            onAnimationEnd={onAnimationEnd}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
