import AppRouter from './router/AppRouter';
import { useEffect, useState } from 'react';
import { useUserStore } from './stores/useUserStore';
import { WishlistProvider } from './reduxSlice/WishlistContext';

function App() {
  const checkAuthStatus = useUserStore(state => state.checkAuthStatus);
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Chỉ check auth nếu có token trong localStorage
        const token = localStorage.getItem('token');
        if (token) {
          await checkAuthStatus();
        }
      } finally {
        // Giảm delay để cải thiện UX
        setTimeout(() => {
          setAppInitialized(true);
        }, 300);
      }
    };

    initializeApp();
  }, [checkAuthStatus]);

  // Hiển thị loading screen khi app đang khởi tạo
  if (!appInitialized) {
    console.log('App is still initializing...'); // Debug log
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-semibold">Đang khởi tạo GreenMart...</p>
          <p className="text-emerald-600 text-sm mt-2">Siêu thị tươi ngon mỗi ngày!</p>
          <p className="text-xs text-gray-500 mt-2">Debug: App not initialized</p>
        </div>
      </div>
    );
  }

  console.log('App initialized successfully'); // Debug log

  return (
    <div className="animate-fadeIn">
      <WishlistProvider>
        <AppRouter />
      </WishlistProvider>
    </div>
  );
}

export default App;
