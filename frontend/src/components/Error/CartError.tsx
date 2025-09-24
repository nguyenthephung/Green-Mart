import React from 'react';
import { ShoppingCart, RefreshCw, Home, Package, AlertTriangle } from 'lucide-react';

interface CartErrorProps {
  errorType?: 'empty' | 'loading_failed' | 'network' | 'sync_failed';
  message?: string;
  onRetry?: () => void;
  onContinueShopping?: () => void;
  onClearCart?: () => void;
}

const CartError: React.FC<CartErrorProps> = ({
  errorType = 'loading_failed',
  message,
  onRetry,
  onContinueShopping,
  onClearCart,
}) => {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'empty':
        return {
          icon: <ShoppingCart className="w-20 h-20 text-gray-400" />,
          title: 'Giỏ hàng trống',
          description:
            message ||
            'Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!',
          bgGradient: 'from-gray-50 to-slate-50',
          iconBg: 'bg-gray-100',
          primaryButton: 'Khám phá sản phẩm',
          primaryAction: onContinueShopping,
          primaryColor: 'bg-green-500 hover:bg-green-600',
          showRetry: false,
          isEmptyState: true,
        };
      case 'network':
        return {
          icon: <AlertTriangle className="w-20 h-20 text-blue-500" />,
          title: 'Mất kết nối',
          description:
            message || 'Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại',
          bgGradient: 'from-blue-50 to-indigo-50',
          iconBg: 'bg-blue-100',
          primaryButton: 'Thử lại',
          primaryAction: onRetry,
          primaryColor: 'bg-blue-500 hover:bg-blue-600',
          showRetry: true,
          isEmptyState: false,
        };
      case 'sync_failed':
        return {
          icon: <Package className="w-20 h-20 text-yellow-500" />,
          title: 'Đồng bộ thất bại',
          description:
            message ||
            'Không thể đồng bộ giỏ hàng. Một số sản phẩm có thể đã hết hàng hoặc thay đổi giá',
          bgGradient: 'from-yellow-50 to-orange-50',
          iconBg: 'bg-yellow-100',
          primaryButton: 'Làm mới giỏ hàng',
          primaryAction: onRetry,
          primaryColor: 'bg-yellow-500 hover:bg-yellow-600',
          showRetry: true,
          isEmptyState: false,
        };
      default:
        return {
          icon: <AlertTriangle className="w-20 h-20 text-red-500" />,
          title: 'Lỗi tải giỏ hàng',
          description:
            message || 'Không thể tải thông tin giỏ hàng. Vui lòng thử lại hoặc liên hệ hỗ trợ',
          bgGradient: 'from-red-50 to-rose-50',
          iconBg: 'bg-red-100',
          primaryButton: 'Thử lại',
          primaryAction: onRetry,
          primaryColor: 'bg-red-500 hover:bg-red-600',
          showRetry: true,
          isEmptyState: false,
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div
        className={`max-w-lg w-full bg-gradient-to-br ${config.bgGradient} rounded-3xl shadow-2xl p-8 text-center border border-white/20`}
      >
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          <div
            className={`${config.iconBg} rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4 ${config.isEmptyState ? 'animate-pulse' : 'animate-bounce'} shadow-lg`}
          >
            {config.icon}
          </div>

          {/* Decorative rings */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-200 w-32 h-32 mx-auto animate-spin-slow opacity-30"></div>
        </div>

        {/* Error Content */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{config.title}</h2>
          <p className="text-gray-600 leading-relaxed text-lg">{config.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Action */}
          {config.primaryAction && (
            <button
              onClick={config.primaryAction}
              className={`w-full ${config.primaryColor} text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg`}
            >
              {config.showRetry ? (
                <RefreshCw className="w-6 h-6" />
              ) : (
                <ShoppingCart className="w-6 h-6" />
              )}
              {config.primaryButton}
            </button>
          )}

          {/* Secondary Actions */}
          <div className="flex gap-3">
            {onContinueShopping && !config.isEmptyState && (
              <button
                onClick={onContinueShopping}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Tiếp tục mua sắm
              </button>
            )}

            {onClearCart && errorType === 'sync_failed' && (
              <button
                onClick={onClearCart}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Xóa giỏ hàng
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        {!config.isEmptyState && (
          <div className="mt-8 p-4 bg-white/50 rounded-xl border border-white/30">
            <p className="text-sm text-gray-500">
              Vẫn gặp sự cố?
              <button className="text-blue-600 hover:text-blue-700 font-medium ml-1 underline">
                Liên hệ hỗ trợ
              </button>
            </p>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="mt-6 flex justify-center space-x-3">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full animate-pulse opacity-50"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CartError;
