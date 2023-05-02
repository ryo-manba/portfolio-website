import { ReactNode } from 'react';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';

type Props = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export const TitleLayout = ({ children, title, subtitle }: Props) => {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow my-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold leading-none">{title}</h1>
            {subtitle && <p className="text-xl ">({subtitle})</p>}
          </div>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};