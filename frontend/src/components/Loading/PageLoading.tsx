import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoadingProps {
  text?: string;
  subText?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Đang khởi tạo GreenMart...',
  subText = 'Siêu thị tươi ngon mỗi ngày!',
}) => {
  return (
    <LoadingSpinner size="xl" text={text} subText={subText} fullScreen={true} variant="primary" />
  );
};

export default PageLoading;
