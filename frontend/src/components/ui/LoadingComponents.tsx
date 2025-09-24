import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'table' | 'product' | 'order';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 3,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'product':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        );

      case 'order':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );

      default: // card
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text = 'Đang tải...',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-2 border-gray-200 dark:border-gray-700 rounded-full animate-pulse`}
        ></div>
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent border-t-green-600 rounded-full animate-spin`}
        ></div>
      </div>
      {text && <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">{text}</p>}
    </div>
  );
};

interface ProgressLoadingProps {
  progress?: number;
  text?: string;
  className?: string;
}

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  progress = 0,
  text = 'Đang xử lý...',
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{text}</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
