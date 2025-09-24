import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top khi route thay đổi
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Sử dụng 'instant' thay vì 'smooth' để tránh delay
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
