import { useState, useEffect } from 'react';

// Tailwind CSS breakpoints
const breakpoints = {
  sm: 640, // Small devices (phones)
  md: 768, // Medium devices (tablets)
  lg: 1024, // Large devices (desktops)
  xl: 1280, // Extra large devices
  '2xl': 1536, // 2X Extra large devices
};

export interface ResponsiveState {
  // Device types
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Specific breakpoints
  isSmall: boolean; // < 640px
  isMedium: boolean; // 640px - 767px
  isLarge: boolean; // 768px - 1023px
  isExtraLarge: boolean; // 1024px - 1279px
  is2XLarge: boolean; // >= 1280px

  // Current width
  width: number;
  height: number;

  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;
}

export const useResponsive = (): ResponsiveState => {
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    // Default fallback for SSR
    return {
      width: 1024,
      height: 768,
    };
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = windowSize;

  // Calculate responsive states
  const isMobile = width < breakpoints.md; // < 768px
  const isTablet = width >= breakpoints.md && width < breakpoints.lg; // 768px - 1023px
  const isDesktop = width >= breakpoints.lg; // >= 1024px

  const isSmall = width < breakpoints.sm; // < 640px
  const isMedium = width >= breakpoints.sm && width < breakpoints.md; // 640px - 767px
  const isLarge = width >= breakpoints.md && width < breakpoints.lg; // 768px - 1023px
  const isExtraLarge = width >= breakpoints.lg && width < breakpoints.xl; // 1024px - 1279px
  const is2XLarge = width >= breakpoints.xl; // >= 1280px

  const isPortrait = height > width;
  const isLandscape = width > height;

  return {
    // Device types
    isMobile,
    isTablet,
    isDesktop,

    // Specific breakpoints
    isSmall,
    isMedium,
    isLarge,
    isExtraLarge,
    is2XLarge,

    // Current dimensions
    width,
    height,

    // Orientation
    isPortrait,
    isLandscape,
  };
};

// Export breakpoints for use in other components
export { breakpoints };

// Utility function to check if current screen matches breakpoint
export const useBreakpoint = (breakpoint: keyof typeof breakpoints): boolean => {
  const { width } = useResponsive();
  return width >= breakpoints[breakpoint];
};

// Hook for getting current breakpoint name
export const useCurrentBreakpoint = (): keyof typeof breakpoints | 'xs' => {
  const { width } = useResponsive();

  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  if (width < breakpoints['2xl']) return 'xl';
  return '2xl';
};
