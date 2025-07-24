// Component chung cho loading trong app
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as PageLoading } from './PageLoading';
export { default as LoadingDots } from './LoadingDots';

// Hook tùy chỉnh cho loading states
import { useState, useEffect } from 'react';

export function useLoading(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return {
    isLoading,
    startLoading,
    stopLoading,
    setIsLoading
  };
}

export function usePageLoading(delay: number = 0) {
  const [loading, setLoading] = useState(delay > 0);
  
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setLoading(false), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);
  
  return loading;
}
