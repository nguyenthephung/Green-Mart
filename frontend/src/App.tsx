import AppRouter from './router/AppRouter';
import { useEffect, memo } from 'react';
import { useUserStore } from './stores/useUserStore';
import { WishlistProvider } from './reduxSlice/WishlistContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProfilerWrapper from './components/ProfilerWrapper';
import { useINPMonitor } from './components/INPMonitor';
import PerformanceDashboard from './components/PerformanceDashboard';

const App = memo(() => {
  const checkAuthStatus = useUserStore(state => state.checkAuthStatus);
  
  // Enable INP monitoring
  useINPMonitor(process.env.NODE_ENV === 'development');

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
            <AppRouter />
          </WishlistProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
      </div>
    </ProfilerWrapper>
  );
});

App.displayName = 'App';

export default App;
