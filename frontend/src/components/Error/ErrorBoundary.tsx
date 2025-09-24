import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorHandler } from '../../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Handle error with our error handler
    ErrorHandler.handleError(error, 'React Error Boundary');

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Oops! Có lỗi xảy ra
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ứng dụng gặp lỗi không mong muốn. Chúng tôi đã ghi nhận lỗi này và sẽ khắc phục sớm
                nhất.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Tải lại trang
                </button>

                <button
                  onClick={() => (window.location.href = '/')}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🏠 Về trang chủ
                </button>
              </div>

              {/* Error details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                    Chi tiết lỗi (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
