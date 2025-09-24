// Simple performance monitoring utility
export const performanceMonitor = {
  // Measure scroll performance
  measureScrollLag: () => {
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (!isScrolling) {
        console.log('🔍 Scroll started');
        isScrolling = true;
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        console.log('✅ Scroll ended');
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  },

  // Log render times
  measureRenderTime: (componentName: string) => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (renderTime > 16.67) {
        // Longer than 1 frame at 60fps
        console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms (> 16.67ms)`);
      } else {
        console.log(`✅ ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    };
  },

  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};

// Auto-disable animations if user prefers reduced motion
export const respectMotionPreference = () => {
  if (performanceMonitor.prefersReducedMotion()) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
    console.log('🎯 Reduced motion preference detected - animations disabled');
  }
};
