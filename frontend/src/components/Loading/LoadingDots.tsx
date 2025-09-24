import React from 'react';

interface LoadingDotsProps {
  text?: string;
  color?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  text = 'Đang tải',
  color = 'var(--brand-green)',
}) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <span className="text-app-primary font-medium">{text}</span>
      <div className="loading-dots">
        <span style={{ background: color }}></span>
        <span style={{ background: color }}></span>
        <span style={{ background: color }}></span>
      </div>
    </div>
  );
};

export default LoadingDots;
