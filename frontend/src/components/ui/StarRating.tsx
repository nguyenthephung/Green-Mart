import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  showValue = false,
  showCount = false,
  count = 0,
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const renderStar = (index: number) => {
    const filled = index < Math.floor(rating);
    const halfFilled = index === Math.floor(rating) && rating % 1 !== 0;

    return (
      <div key={index} className="relative">
        {/* Empty star background */}
        <svg
          className={`${sizeClasses[size]} text-gray-300`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>

        {/* Filled star */}
        {(filled || halfFilled) && (
          <svg
            className={`${sizeClasses[size]} text-yellow-400 absolute top-0 left-0 overflow-hidden`}
            style={{
              clipPath: halfFilled ? 'inset(0 50% 0 0)' : 'none',
            }}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>

      {showValue && (
        <span className={`font-medium text-gray-700 dark:text-gray-300 ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}

      {showCount && count > 0 && (
        <span className={`text-gray-500 dark:text-gray-400 ${textSizeClasses[size]}`}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
