// Service Worker registration utility
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker available
                console.log('New content available! Please refresh.');
                
                // Show update notification
                if (window.confirm('Có phiên bản mới! Bạn có muốn cập nhật không?')) {
                  window.location.reload();
                }
              } else {
                // Content cached for offline use
                console.log('Content cached for offline use.');
              }
            }
          });
        }
      });
      
      console.log('SW registered: ', registration);
    } catch (error) {
      console.error('SW registration failed: ', error);
    }
  }
};

// Unregister service worker (for development)
export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('SW unregistered');
    } catch (error) {
      console.error('SW unregistration failed: ', error);
    }
  }
};

// Check for SW updates
export const checkForUpdates = async (): Promise<void> => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    } catch (error) {
      console.error('SW update check failed: ', error);
    }
  }
};