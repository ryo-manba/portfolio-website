import { Home } from '@/app/home-page';
import { Metadata } from 'next';

const title = 'Ryo Matsukawa のホームページ';
const description =
  '猫とワインが好きなソフトウェアエンジニアのホームページです。';
const url = `${process.env.NEXT_PUBLIC_SITE_URL}/`;
const images = `${process.env.NEXT_PUBLIC_SITE_URL}/images/home.webp`;

export const metadata: Metadata = {
  title: 'Home | ryo-manba',
  openGraph: {
    title,
    description,
    url,
    images,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images,
  },
};

const Page = () => {
  return <Home />;
};

export default Page;
