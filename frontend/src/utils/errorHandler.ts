import { useToastStore } from '../stores/useToastStore';

export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  validationErrors?: ValidationError[];
}

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.',
  VALIDATION: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  AUTHENTICATION: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  AUTHORIZATION: 'Bạn không có quyền thực hiện hành động này.',
  NOT_FOUND: 'Không tìm thấy tài nguyên được yêu cầu.',
  SERVER: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  CLIENT: 'Yêu cầu không hợp lệ.',
  UNKNOWN: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',

  // Specific error messages
  LOGIN_FAILED: 'Thông tin đăng nhập không chính xác.',
  REGISTER_FAILED: 'Đăng ký thất bại. Email có thể đã được sử dụng.',
  PASSWORD_WEAK: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.',
  EMAIL_INVALID: 'Địa chỉ email không hợp lệ.',
  REQUIRED_FIELD: 'Trường này là bắt buộc.',
  FILE_TOO_LARGE: 'File quá lớn. Kích thước tối đa là',
  FILE_INVALID_TYPE: 'Loại file không được hỗ trợ.',
  CART_EMPTY: 'Giỏ hàng trống.',
  STOCK_INSUFFICIENT: 'Sản phẩm không đủ số lượng trong kho.',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
  PAYMENT_FAILED: 'Thanh toán thất bại. Vui lòng thử lại.',
  ADDRESS_REQUIRED: 'Vui lòng chọn địa chỉ giao hàng.',
  VOUCHER_INVALID: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.',
} as const;

export class ErrorHandler {
  static getErrorType(error: any): keyof typeof ERROR_TYPES {
    if (!error) return 'UNKNOWN';

    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
      return 'NETWORK';
    }

    // HTTP status code based errors
    if (error.statusCode || error.status) {
      const statusCode = error.statusCode || error.status;

      if (statusCode === 400) return 'VALIDATION';
      if (statusCode === 401) return 'AUTHENTICATION';
      if (statusCode === 403) return 'AUTHORIZATION';
      if (statusCode === 404) return 'NOT_FOUND';
      if (statusCode >= 500) return 'SERVER';
      if (statusCode >= 400) return 'CLIENT';
    }

    // Custom error codes
    if (error.code) {
      switch (error.code) {
        case 'VALIDATION_ERROR':
          return 'VALIDATION';
        case 'AUTH_ERROR':
          return 'AUTHENTICATION';
        case 'AUTHORIZATION_ERROR':
          return 'AUTHORIZATION';
        default:
          return 'UNKNOWN';
      }
    }

    return 'UNKNOWN';
  }

  static formatError(error: any): ErrorInfo {
    const errorType = this.getErrorType(error);

    return {
      message: error.message || ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN,
      code: error.code || errorType,
      statusCode: error.statusCode || error.status,
      details: error.details || error.response?.data,
    };
  }

  static handleError(error: any, context?: string): void {
    console.error('Error occurred:', error, 'Context:', context);

    const errorInfo = this.formatError(error);
    const errorType = this.getErrorType(error);

    // Get current toast store state
    const toastStore = useToastStore.getState();

    // Handle validation errors specially
    if (errorType === 'VALIDATION' && error.validationErrors) {
      const validationMessages = error.validationErrors
        .map((err: ValidationError) => `${err.field}: ${err.message}`)
        .join('\n');

      toastStore.showError('Lỗi xác thực', validationMessages || ERROR_MESSAGES.VALIDATION);
      return;
    }

    // Handle authentication errors
    if (errorType === 'AUTHENTICATION') {
      // Don't redirect to login for automatic auth checks or on homepage/public pages
      const currentPath = window.location.pathname;
      const isPublicPage = [
        '/',
        '/home',
        '/search',
        '/products',
        '/product',
        '/about',
        '/policy',
        '/flash-sale',
      ].some(path => currentPath === path || currentPath.startsWith(path));

      // Only show error and redirect if user is on a protected page or explicitly tried to access something
      if (!isPublicPage && context !== 'Auth Check') {
        toastStore.showError('Lỗi xác thực', errorInfo.message);

        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      return;
    }

    // Handle other errors
    const title = this.getErrorTitle(errorType);
    toastStore.showError(title, errorInfo.message);
  }

  private static getErrorTitle(errorType: keyof typeof ERROR_TYPES): string {
    switch (errorType) {
      case 'NETWORK':
        return 'Lỗi kết nối';
      case 'VALIDATION':
        return 'Lỗi xác thực';
      case 'AUTHENTICATION':
        return 'Lỗi xác thực';
      case 'AUTHORIZATION':
        return 'Không có quyền';
      case 'NOT_FOUND':
        return 'Không tìm thấy';
      case 'SERVER':
        return 'Lỗi máy chủ';
      case 'CLIENT':
        return 'Lỗi yêu cầu';
      default:
        return 'Lỗi hệ thống';
    }
  }

  static createApiError(
    message: string,
    statusCode?: number,
    code?: string,
    details?: any
  ): ApiError {
    const error = new Error(message) as ApiError;
    error.statusCode = statusCode;
    error.code = code;
    error.details = details;
    return error;
  }

  static createValidationError(message: string, validationErrors: ValidationError[]): ApiError {
    const error = new Error(message) as ApiError;
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.validationErrors = validationErrors;
    return error;
  }

  // Wrapper for async operations with error handling
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string,
    customErrorHandler?: (error: any) => void
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      if (customErrorHandler) {
        customErrorHandler(error);
      } else {
        this.handleError(error, context);
      }
      return null;
    }
  }

  // Form validation helper
  static validateForm(data: Record<string, any>, rules: Record<string, any>): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      if (rule.required && (!value || value.toString().trim() === '')) {
        errors.push({
          field,
          message: rule.message || ERROR_MESSAGES.REQUIRED_FIELD,
        });
        continue;
      }

      if (value && rule.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({
            field,
            message: rule.message || ERROR_MESSAGES.EMAIL_INVALID,
          });
        }
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        errors.push({
          field,
          message: rule.message || `Tối thiểu ${rule.minLength} ký tự`,
        });
      }

      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          field,
          message: rule.message || `Tối đa ${rule.maxLength} ký tự`,
        });
      }

      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          field,
          message: rule.message || 'Định dạng không hợp lệ',
        });
      }
    }

    return errors;
  }
}

export default ErrorHandler;
