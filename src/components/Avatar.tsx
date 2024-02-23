"use client";

import { useState } from "react";
import Image from "next/image";

const PROFILE_IMAGE_PATH = "/images/profile-image.webp";
const PROFILE_IMAGE_PATH2 = "/images/profile-image2.webp";

export const Avatar = () => {
  const [imageSrc, setImageSrc] = useState(PROFILE_IMAGE_PATH);
  const [animateRotate, setAnimateRotate] = useState(false);

  const toggleImage = () => {
    setAnimateRotate(true);
    setImageSrc((prevSrc) => (prevSrc === PROFILE_IMAGE_PATH ? PROFILE_IMAGE_PATH2 : PROFILE_IMAGE_PATH));
  };

  const onAnimationEnd = () => {
    setAnimateRotate(false);
  };

  return (
    <button className="h-40 w-40 md:h-72 md:w-72 order-first md:order-last mb-10" onClick={toggleImage} type="button">
      <Image
        alt="Avatar image"
        src={imageSrc}
        loading="lazy"
        width={1500}
        height={1500}
        className={animateRotate ? "animate-rotate-coin" : ""}
        onAnimationEnd={onAnimationEnd}
      />
    </button>
  );
};
