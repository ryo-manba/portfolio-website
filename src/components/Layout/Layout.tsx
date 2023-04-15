import { ReactNode } from 'react';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};
