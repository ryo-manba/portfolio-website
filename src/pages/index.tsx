import Link from 'next/link';
import Image from 'next/image';

const Home = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-center px-3 max-w-screen-lg mx-auto py-32">
        <div className="flex flex-col items-center md:flex-row md:gap-x-16 md:justify-between justify-center">
          <div>
            <h1 className="font-bold text-3xl">
              Hi there<span className="animate-wave">👋</span>
              <br />
              I&#x27;m Ryo Matsukawa
            </h1>
            <p className="leading-9 mt-6 text-xl">
              猫とワインが好きなソフトウェアエンジニア
              <br />
              サイボウズで働いています。42 Tokyo Alumni。
            </p>
            <nav>
              <ul className="flex font-medium text-gray-400 gap-x-3 pt-2">
                <li className="hover:text-gray-200">
                  <Link href="/posts">Posts</Link>
                </li>
                <li className="hover:text-gray-200">
                  <Link href="/works">Works</Link>
                </li>
                <li className="hover:text-gray-200">
                  <Link href="/skills">Skills</Link>
                </li>
                <li className="hover:text-gray-200">
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
          <div className="hidden md:block shrink-0">
            <div className="h-72 w-72" id="my-icon-large">
              <Image
                alt="Avatar image"
                src="/images/profile-image2.png"
                loading="lazy"
                width={250}
                height={250}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
