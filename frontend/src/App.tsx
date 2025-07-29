import AppRouter from './router/AppRouter';
import { useEffect, memo } from 'react';
import { useUserStore } from './stores/useUserStore';
import { useProductStore } from './stores/useProductStore';
import { ThemeProvider } from './contexts/ThemeContext';
import ProfilerWrapper from './components/ProfilerWrapper';
import { useCategoryStore } from './stores/useCategoryStore';

const App = memo(() => {
  const checkAuthStatus = useUserStore(state => state.checkAuthStatus);
  const fetchAll = useProductStore(state => state.fetchAll);
  const products = useProductStore(state => state.products);
  const fetchCategories = useCategoryStore(state => state.fetchCategories);
  const categories = useCategoryStore(state => state.categories);

  // Fetch sản phẩm và category một lần khi app khởi động
  useEffect(() => {
    if (!products || products.length === 0) {
      fetchAll && fetchAll();
    }
    if (!categories || categories.length === 0) {
      fetchCategories && fetchCategories();
    }
  }, [products, fetchAll, categories, fetchCategories]);
  
  // Enable INP monitoring


  useEffect(() => {
    // Chạy auth check trong background với debounce
    let timeoutId: NodeJS.Timeout;
    
    const runAuthCheck = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && checkAuthStatus) {
          // Delay để tránh block UI thread
          timeoutId = setTimeout(async () => {
            await checkAuthStatus();
          }, 100);
        }
      } catch (error) {
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
      </div>
    </ProfilerWrapper>
  );
});

App.displayName = 'App';

export default App;
