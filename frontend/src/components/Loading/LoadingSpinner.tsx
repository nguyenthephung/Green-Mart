import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  subText?: string;
  fullScreen?: boolean;
  variant?: 'primary' | 'secondary' | 'white';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Đang tải...',
  subText,
  fullScreen = false,
  variant = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variantClasses = {
    primary: 'border-brand-green',
    secondary: 'border-gray-400',
    white: 'border-white'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className="text-center">
      <div className={`
        ${sizeClasses[size]} 
        border-4 
        ${variantClasses[variant]} 
        border-t-transparent 
        rounded-full 
        animate-spin 
        mx-auto 
        mb-3
      `}></div>
      {text && (
        <p className={`text-app-primary font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
      {subText && (
        <p className="text-app-secondary text-sm mt-1">
          {subText}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-app-main">
        <div className="animate-fadeIn">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
