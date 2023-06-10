import '@/../styles/globals.css';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReactNode } from 'react';

const SITE_NAME = 'ryo-manba';
const TWITTER_ID = '@ryo_manba';

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  openGraph: {
    title: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
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
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
