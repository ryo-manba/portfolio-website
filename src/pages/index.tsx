import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';
export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow"></main>
        <Footer />
      </div>
    </>
  );
}
