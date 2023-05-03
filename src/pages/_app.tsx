import '@/../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { BasicLayout } from '@/components/Layout/BasicLayout';
import { NextPageWithLayout } from '@/types/NextPageWithLayout';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <BasicLayout>{page}</BasicLayout>);

  return (
    <>
      <Head>
        <link
          rel="icon"
          href="/favicon/icons8-kitty-cute-color-16.png"
          sizes="16x16"
          type="image/png"
        />
        <link
          rel="icon"
          href="/favicon/icons8-kitty-cute-color-32.png"
          sizes="32x32"
          type="image/png"
        />
        <link
          rel="icon"
          href="/favicon/icons8-kitty-cute-color-96.png"
          sizes="96x96"
          type="image/png"
        />
      </Head>
      {getLayout(<Component {...pageProps} />)}
    </>
  );
}
