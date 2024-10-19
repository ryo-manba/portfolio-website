"use client";

import { useState } from "react";
import Image from "next/image";

const PROFILE_IMAGE_PATH = "/images/profile-image.webp";

export const Avatar = () => {
  const [animateRotate, setAnimateRotate] = useState(false);

  const toggleImage = () => {
    setAnimateRotate(true);
  };

  const onAnimationEnd = () => {
    setAnimateRotate(false);
  };

  return (
    <button className="h-40 w-40 md:h-72 md:w-72 order-first md:order-last mb-10" onClick={toggleImage} type="button">
      <Image
        alt="Avatar image"
        src={PROFILE_IMAGE_PATH}
        loading="lazy"
        width={1500}
        height={1500}
        className={animateRotate ? "animate-rotate-coin" : ""}
        onAnimationEnd={onAnimationEnd}
      />
    </button>
  );
};
