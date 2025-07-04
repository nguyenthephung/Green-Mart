import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../components/Guest/Header';
import Footer from '../components/Guest/Footer';

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Điều kiện xác định trang cần full-width (bao gồm /home và /ordertracking)
  const isFullWidthPage = location.pathname === '/home' || location.pathname.startsWith('/ordertracking');

  return (
    <div className="font-sans flex flex-col min-h-screen">
      <Header />
      <main className={`flex-1 pt-20 ${isFullWidthPage ? 'px-4 py-6' : 'px-4 py-6 max-w-6xl mx-auto'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}