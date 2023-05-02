import '@/../styles/globals.css';
import type { AppProps } from 'next/app';
import { BasicLayout } from '@/components/Layout/BasicLayout';
import { NextPageWithLayout } from '@/types/NextPageWithLayout';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <BasicLayout>{page}</BasicLayout>);

  return getLayout(<Component {...pageProps} />);
}
