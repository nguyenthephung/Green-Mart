import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../components/Guest/Header';
import Footer from '../components/Guest/Footer';


export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    // Chỉ scroll smooth cho các trang không phải home để tránh lag
    if (location.pathname === '/home') {
      // Immediate scroll for home page để tránh lag
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
    } else {
      // Smooth scroll cho các trang khác
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // Điều kiện xác định trang cần full-width (bao gồm /home và /ordertracking)
  const isFullWidthPage = location.pathname === '/home' || location.pathname.startsWith('/ordertracking');

  return (
   
        <div className="font-sans flex flex-col min-h-screen">
          <Header />
          <main className={`flex-1 pt-[104px] md:pt-[88px] lg:pt-[80px] ${isFullWidthPage ? 'px-4 py-6' : 'px-4 py-6 max-w-6xl mx-auto'}`}>
            <Outlet />
          </main>
          <Footer />
        </div>
   
  );
}