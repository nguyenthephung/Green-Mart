import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout() {
  const location = useLocation();

  // Điều kiện xác định trang cần full-width
  const isFullWidthPage = location.pathname.startsWith('/ordertracking'); // bạn chỉnh lại path cho đúng

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      <main className={`flex-1 px-4 py-6 ${isFullWidthPage ? '' : 'max-w-6xl mx-auto'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
