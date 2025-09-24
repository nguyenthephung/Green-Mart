import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to automatically scroll to top for admin routes
 * Provides smooth scrolling animation and preserves scroll position for non-admin routes
 */
export const useAdminAutoScroll = (options?: {
  behavior?: ScrollBehavior;
  delay?: number;
  enabledRoutes?: string[];
}) => {
  const location = useLocation();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { behavior = 'smooth', delay = 100, enabledRoutes = ['/admin'] } = options || {};

  useEffect(() => {
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Check if current route should trigger auto-scroll
    const shouldAutoScroll = enabledRoutes.some(route => location.pathname.startsWith(route));

    if (shouldAutoScroll) {
      // Add a small delay to ensure DOM is fully rendered
      scrollTimeoutRef.current = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior,
        });

        // Also scroll any main content containers to top
        const mainContent = document.querySelector('[data-main-content]');
        if (mainContent) {
          mainContent.scrollTo({
            top: 0,
            left: 0,
            behavior,
          });
        }

        // Scroll admin layout container if exists
        const adminContainer = document.querySelector('.admin-layout-container');
        if (adminContainer) {
          adminContainer.scrollTo({
            top: 0,
            left: 0,
            behavior,
          });
        }
      }, delay);
    }

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [location.pathname, behavior, delay, enabledRoutes]);

  // Return utility functions for manual scroll control
  return {
    scrollToTop: (customBehavior?: ScrollBehavior) => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: customBehavior || behavior,
      });
    },

    scrollToElement: (element: Element | string, offset = 0) => {
      const target = typeof element === 'string' ? document.querySelector(element) : element;

      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - offset;

        window.scrollTo({
          top: scrollTop,
          behavior,
        });
      }
    },

    isAdminRoute: () => {
      return enabledRoutes.some(route => location.pathname.startsWith(route));
    },
  };
};

export default useAdminAutoScroll;
