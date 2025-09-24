import React from 'react';
import { RefreshCw, Wifi, AlertCircle, Home } from 'lucide-react';

interface HomeErrorProps {
  errorType?: 'network' | 'server' | 'general';
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

const HomeError: React.FC<HomeErrorProps> = ({
  errorType = 'general',
  message,
  onRetry,
  onGoHome,
}) => {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: <Wifi className="w-16 h-16 text-blue-500" />,
          title: 'Mất kết nối mạng',
          description: message || 'Vui lòng kiểm tra kết nối internet và thử lại',
          bgGradient: 'from-blue-50 to-cyan-50',
          iconBg: 'bg-blue-100',
          buttonColor: 'bg-blue-500 hover:bg-blue-600',
        };
      case 'server':
        return {
          icon: <AlertCircle className="w-16 h-16 text-orange-500" />,
          title: 'Lỗi máy chủ',
          description: message || 'Hệ thống đang bảo trì. Vui lòng thử lại sau ít phút',
          bgGradient: 'from-orange-50 to-amber-50',
          iconBg: 'bg-orange-100',
          buttonColor: 'bg-orange-500 hover:bg-orange-600',
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-500" />,
          title: 'Đã có lỗi xảy ra',
          description: message || 'Không thể tải dữ liệu trang chủ. Vui lòng thử lại',
          bgGradient: 'from-red-50 to-pink-50',
          iconBg: 'bg-red-100',
          buttonColor: 'bg-red-500 hover:bg-red-600',
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div
        className={`max-w-md w-full bg-gradient-to-br ${config.bgGradient} rounded-3xl shadow-xl p-8 text-center transform transition-all duration-300 hover:scale-105`}
      >
        {/* Animated Icon */}
        <div
          className={`${config.iconBg} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-bounce`}
        >
          {config.icon}
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{config.title}</h1>

        {/* Error Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">{config.description}</p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`w-full ${config.buttonColor} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              <RefreshCw className="w-5 h-5" />
              Thử lại
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </button>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center space-x-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeError;
