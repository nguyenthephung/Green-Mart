import AppRouter from './router/AppRouter';
import { useEffect, memo } from 'react';
import { useUserStore } from './stores/useUserStore';
import { WishlistProvider } from './reduxSlice/WishlistContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProfilerWrapper from './components/ProfilerWrapper';

const App = memo(() => {
  const checkAuthStatus = useUserStore(state => state.checkAuthStatus);
  
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
          <WishlistProvider>
            {/* Xóa padding-top, header sticky sẽ tự xử lý */}
            <AppRouter />
          </WishlistProvider>
        </ThemeProvider>
        {/* Đã xóa PerformanceDashboard */}
      </div>
    </ProfilerWrapper>
  );
});

App.displayName = 'App';

export default App;
