import '@/styles/globals.css';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReactNode } from 'react';

const SITE_NAME = 'ryo-manba';
const TWITTER_ID = '@ryo_manba';

const title = 'Ryo Matsukawa のホームページ';
const description =
  '猫とワインが好きなソフトウェアエンジニアのホームページです。';
const url = `${process.env.NEXT_PUBLIC_SITE_URL}/`;
const images = `${process.env.NEXT_PUBLIC_SITE_URL}/images/home.webp`;

export const metadata: Metadata = {
  title: {
    default: `Home | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  openGraph: {
    title,
    locale: 'ja_JP',
    type: 'website',
    description,
    url,
    images,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images,
    site: TWITTER_ID,
    creator: TWITTER_ID,
  },
  metadataBase: new URL(process.env.URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow my-12">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
