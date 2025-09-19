import AppRouter from './router/AppRouter';
import { useEffect, memo } from 'react';
import { useUserStore } from './stores/useUserStore';
import { useProductStore } from './stores/useProductStore';
import { ThemeProvider } from './contexts/ThemeContext';
import ProfilerWrapper from './components/ProfilerWrapper';
import { useCategoryStore } from './stores/useCategoryStore';
import { useVoucherStore } from './stores/useVoucherStore';
// import { useToastStore } from './stores/useToastStore';
// import ToastContainer from './components/ui/Toast/ToastContainer';
import { useNewToastStore } from './stores/useNewToastStore';
import NewToastContainer from './components/ui/Toast/NewToastContainer';
import { useAuthSync } from './hooks/useAuthSync';


const App = memo(() => {
  const checkAuthStatus = useUserStore(state => state.checkAuthStatus);
  const fetchAll = useProductStore(state => state.fetchAll);
  const fetchCategories = useCategoryStore(state => state.fetchCategories);
  const fetchVouchers = useVoucherStore(state => state.fetchVouchers);
  // const { toasts, removeToast } = useToastStore();
  
  // New Toast System
  const { toasts: newToasts, removeToast: removeNewToast } = useNewToastStore();
  
  // Hook để sync wishlist và cart khi user thay đổi
  useAuthSync();

 

  // Fetch sản phẩm, category, voucher một lần khi app khởi động (chỉ chạy 1 lần khi mount)
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchAll?.(),
          fetchCategories?.(),
          fetchVouchers?.()
        ]);
      } catch (error) {
        console.error('Error initializing app data:', error);
      }
    };
    
    initializeData();
  }, [fetchAll, fetchCategories, fetchVouchers]);

  // Enable INP monitoring

  useEffect(() => {
    // Chạy auth check trong background với debounce
    let timeoutId: NodeJS.Timeout;

    const runAuthCheck = async () => {
      try {
        const token = localStorage.getItem('token');
        const lastVisit = localStorage.getItem('lastVisit');
        const now = Date.now();
        
        // Check if it's been more than 24 hours since last visit
        if (lastVisit) {
          const lastVisitTime = parseInt(lastVisit);
          const hoursSinceLastVisit = (now - lastVisitTime) / (1000 * 60 * 60);
          
          if (hoursSinceLastVisit > 24) {
            console.log('Long time since last visit, clearing cache...');
            // Clear potentially stale data
            localStorage.removeItem('user-storage');
            localStorage.removeItem('cart-storage');
            localStorage.removeItem('product-storage');
          }
        }
        
        // Update last visit time
        localStorage.setItem('lastVisit', now.toString());
        
        if (token && checkAuthStatus) {
          // Delay để tránh block UI thread
          timeoutId = setTimeout(async () => {
            await checkAuthStatus();
          }, 100);
        }
      } catch (error) {
        console.error('Error during auth check:', error);
        localStorage.removeItem('token');
      }
    };

    runAuthCheck();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [checkAuthStatus]);

  return (
    <ProfilerWrapper id="App">
      <div className="animate-fadeIn">
        <ThemeProvider>
          {/* Xóa padding-top, header sticky sẽ tự xử lý */}
          <AppRouter />
        </ThemeProvider>
        {/* Đã xóa PerformanceDashboard */}
        
        {/* New Toast System */}
        <NewToastContainer 
          toasts={newToasts} 
          onClose={removeNewToast}
          position="top-right"
          maxToasts={5}
        />
      </div>
    </ProfilerWrapper>
  );
});

App.displayName = 'App';

export default App;
