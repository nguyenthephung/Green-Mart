import React, { useState } from 'react';

interface BannerImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
  fallbackText?: string;
}

const BannerImage: React.FC<BannerImageProps> = ({ 
  src, 
  alt, 
  className = '',
  fallbackIcon = '🖼️',
  fallbackText = 'Không có ảnh'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // If no src or image error, show fallback
  if (!src || imageError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">{fallbackIcon}</div>
          <p className="text-sm font-medium">{fallbackText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <div className="text-gray-400">
            <div className="text-2xl mb-1">⏳</div>
            <p className="text-xs">Đang tải...</p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default BannerImage;
