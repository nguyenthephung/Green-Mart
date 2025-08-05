import React, { useState } from 'react';

interface InteractiveRatingProps {
  initialRating?: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

const InteractiveRating: React.FC<InteractiveRatingProps> = ({
  initialRating = 0,
  maxRating = 5,
  size = 'md',
  onRatingChange,
  disabled = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleStarClick = (value: number) => {
    if (disabled) return;
    
    setRating(value);
    onRatingChange(value);
  };

  const handleMouseEnter = (value: number) => {
    if (disabled) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  const renderStar = (index: number) => {
    const value = index + 1;
    const filled = value <= (hoverRating || rating);

    return (
      <button
        key={index}
        type="button"
        className={`focus:outline-none transition-colors duration-150 ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
        }`}
        onClick={() => handleStarClick(value)}
        onMouseEnter={() => handleMouseEnter(value)}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
      >
        <svg
          className={`${sizeClasses[size]} transition-colors duration-150 ${
            filled
              ? 'text-yellow-400'
              : 'text-gray-300 hover:text-yellow-300'
          } ${disabled ? 'opacity-50' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {rating} out of {maxRating} stars
        </span>
      )}
    </div>
  );
};

export default InteractiveRating;
