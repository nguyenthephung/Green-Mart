import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MainLayout() {
  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-content mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}