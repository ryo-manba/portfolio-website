import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "@/styles/globals.css";
import { Metadata } from "next";
import { ReactNode } from "react";
import { ClientProviders } from "./provider";

const SITE_NAME = "ryo-manba";
const TWITTER_ID = "@ryo_manba";
const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

const title = "Ryo Matsukawa のホームページ";
const description = "猫とワインが好きなソフトウェアエンジニアのホームページです。";
const url = `${PUBLIC_SITE_URL}/`;
const images = `${PUBLIC_SITE_URL}/images/home.webp`;

export const metadata: Metadata = {
  title: {
    default: `Home | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  openGraph: {
    title,
    locale: "ja_JP",
    type: "website",
    description,
    url,
    images,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images,
    site: TWITTER_ID,
    creator: TWITTER_ID,
  },
  metadataBase: new URL(PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-w-[320px]">
        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow my-12">{children}</main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
