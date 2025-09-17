import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { LoadingSpinner } from './Loading';

interface LazySectionProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  placeholder?: ReactNode;
  className?: string;
  delay?: number;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  placeholder,
  className = '',
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isVisible) {
      if (delay > 0) {
        const timer = setTimeout(() => {
          setShouldRender(true);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        setShouldRender(true);
      }
    }
  }, [isVisible, delay]);

  const defaultPlaceholder = (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : (placeholder || defaultPlaceholder)}
    </div>
  );
};

export default LazySection;