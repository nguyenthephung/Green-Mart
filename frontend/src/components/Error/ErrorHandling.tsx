import React, { useState } from 'react';
import HomeError from '../Error/HomeError';
import CartError from '../Error/CartError';

// Example usage for HomePage
export const useHomeErrorHandling = () => {
  const [error, setError] = useState<{
    type: 'network' | 'server' | 'general' | null;
    message?: string;
  }>({ type: null });

  const handleNetworkError = (message?: string) => {
    setError({ type: 'network', message });
  };

  const handleServerError = (message?: string) => {
    setError({ type: 'server', message });
  };

  const handleGeneralError = (message?: string) => {
    setError({ type: 'general', message });
  };

  const clearError = () => {
    setError({ type: null });
  };

  const retryAction = () => {
    clearError();
    // Thực hiện logic retry ở đây
    window.location.reload();
  };

  const goHome = () => {
    clearError();
    window.location.href = '/home';
  };

  const ErrorComponent = error.type ? (
    <HomeError
      errorType={error.type}
      message={error.message}
      onRetry={retryAction}
      onGoHome={goHome}
    />
  ) : null;

  return {
    error: error.type,
    handleNetworkError,
    handleServerError,
    handleGeneralError,
    clearError,
    ErrorComponent,
  };
};

// Example usage for CartPage
export const useCartErrorHandling = () => {
  const [error, setError] = useState<{
    type: 'empty' | 'loading_failed' | 'network' | 'sync_failed' | null;
    message?: string;
  }>({ type: null });

  const handleEmptyCart = (message?: string) => {
    setError({ type: 'empty', message });
  };

  const handleLoadingFailed = (message?: string) => {
    setError({ type: 'loading_failed', message });
  };

  const handleNetworkError = (message?: string) => {
    setError({ type: 'network', message });
  };

  const handleSyncFailed = (message?: string) => {
    setError({ type: 'sync_failed', message });
  };

  const clearError = () => {
    setError({ type: null });
  };

  const retryAction = () => {
    clearError();
    // Thực hiện logic retry ở đây
    window.location.reload();
  };

  const continueShopping = () => {
    clearError();
    window.location.href = '/home';
  };

  const clearCart = () => {
    // Logic xóa cart
    localStorage.removeItem('cart');
    clearError();
    window.location.reload();
  };

  const ErrorComponent = error.type ? (
    <CartError
      errorType={error.type}
      message={error.message}
      onRetry={retryAction}
      onContinueShopping={continueShopping}
      onClearCart={clearCart}
    />
  ) : null;

  return {
    error: error.type,
    handleEmptyCart,
    handleLoadingFailed,
    handleNetworkError,
    handleSyncFailed,
    clearError,
    ErrorComponent,
  };
};

// Example component showing how to use these hooks
export const HomePageWithErrorHandling: React.FC = () => {
  const { error, handleNetworkError, handleServerError, ErrorComponent } = useHomeErrorHandling();
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/home-data');
      if (!response.ok) {
        if (response.status >= 500) {
          handleServerError('Máy chủ đang bảo trì. Vui lòng thử lại sau.');
        } else {
          handleNetworkError('Mất kết nối. Vui lòng kiểm tra mạng.');
        }
        return;
      }
      // Xử lý data thành công
    } catch (err) {
      handleNetworkError('Không thể kết nối tới máy chủ');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return ErrorComponent;
  }

  return (
    <div>
      {/* Nội dung HomePage bình thường */}
      <h1>Trang chủ</h1>
      {loading && <div>Đang tải...</div>}
      <button onClick={fetchData}>Tải dữ liệu</button>
    </div>
  );
};

export const CartPageWithErrorHandling: React.FC = () => {
  const { error, handleEmptyCart, handleSyncFailed, ErrorComponent } = useCartErrorHandling();
  const [cartItems] = useState<any[]>([]);

  const checkCartStatus = () => {
    if (cartItems.length === 0) {
      handleEmptyCart('Giỏ hàng của bạn đang trống. Hãy thêm sản phẩm để tiếp tục!');
      return;
    }
    // Logic kiểm tra sync
    if (Math.random() > 0.8) {
      handleSyncFailed('Một số sản phẩm trong giỏ hàng đã thay đổi giá hoặc hết hàng');
    }
  };

  if (error) {
    return ErrorComponent;
  }

  return (
    <div>
      {/* Nội dung CartPage bình thường */}
      <h1>Giỏ hàng</h1>
      <button onClick={checkCartStatus}>Kiểm tra giỏ hàng</button>
    </div>
  );
};

export default {
  useHomeErrorHandling,
  useCartErrorHandling,
  HomePageWithErrorHandling,
  CartPageWithErrorHandling,
};
