/**
 * Network Utilities for Localhost Development
 *
 * Các trường hợp lỗi mạng phổ biến trong môi trường localhost:
 *
 * 1. Backend Server Issues:
 *    - Server crash/dừng hoạt động
 *    - Port conflict (3001 đã được sử dụng)
 *    - Database connection failed
 *    - Out of memory
 *
 * 2. Frontend Issues:
 *    - Vite dev server crash
 *    - Hot reload failed
 *    - Build errors
 *    - Memory leaks
 *
 * 3. Network Configuration:
 *    - DNS resolution issues
 *    - Firewall blocking
 *    - Proxy conflicts
 *    - Browser cache problems
 *
 * 4. API/Data Loading:
 *    - Slow database queries
 *    - Large payload timeout
 *    - Too many concurrent requests
 *    - API rate limiting
 */

export interface NetworkErrorDetails {
  type: 'server_down' | 'timeout' | 'connection_refused' | 'cors' | 'parse_error' | 'unknown';
  message: string;
  suggestion: string;
  technicalDetails?: string;
}

/**
 * Phân tích lỗi network và đưa ra gợi ý khắc phục
 */
export const analyzeNetworkError = (error: any): NetworkErrorDetails => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorName = error?.name?.toLowerCase() || '';

  // Server không phản hồi (Backend crash)
  if (errorMessage.includes('fetch') && errorMessage.includes('failed')) {
    return {
      type: 'server_down',
      message: 'Backend server không phản hồi',
      suggestion: 'Kiểm tra xem backend server có đang chạy không tại http://localhost:3001',
      technicalDetails: 'TypeError: Failed to fetch - Server có thể đã crash hoặc chưa khởi động',
    };
  }

  // Connection refused (Port không available)
  if (errorMessage.includes('connection refused') || errorMessage.includes('econnrefused')) {
    return {
      type: 'connection_refused',
      message: 'Không thể kết nối đến server',
      suggestion:
        'Backend server chưa khởi động hoặc port 3001 bị conflict. Chạy: npm run dev (backend)',
      technicalDetails: 'ECONNREFUSED - Port 3001 không có service nào đang lắng nghe',
    };
  }

  // Timeout (Server quá chậm)
  if (errorName === 'aborterror' || errorMessage.includes('timeout')) {
    return {
      type: 'timeout',
      message: 'Server phản hồi quá chậm',
      suggestion:
        'Database query có thể quá chậm hoặc server đang overload. Kiểm tra console backend.',
      technicalDetails: 'Request timeout sau 5 giây - Server processing quá lâu',
    };
  }

  // CORS Error (Cấu hình backend sai)
  if (errorMessage.includes('cors') || errorMessage.includes('cross-origin')) {
    return {
      type: 'cors',
      message: 'Lỗi CORS policy',
      suggestion: 'Backend chưa cấu hình CORS cho localhost:3000. Cần thêm CORS middleware.',
      technicalDetails: 'CORS policy blocking request từ localhost:3000 đến localhost:3001',
    };
  }

  // JSON Parse Error (API response bị lỗi)
  if (errorMessage.includes('json') || errorMessage.includes('parse')) {
    return {
      type: 'parse_error',
      message: 'Dữ liệu trả về không hợp lệ',
      suggestion: 'Backend API trả về format không đúng. Kiểm tra response format.',
      technicalDetails: 'JSON parse error - API response không phải valid JSON',
    };
  }

  // Unknown error
  return {
    type: 'unknown',
    message: 'Lỗi không xác định',
    suggestion: 'Kiểm tra network tab trong DevTools để xem chi tiết lỗi.',
    technicalDetails: `${errorName}: ${errorMessage}`,
  };
};

/**
 * Fetch với retry và timeout handling
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  timeout = 5000
): Promise<Response> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error: any) {
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
};

/**
 * Health check cho backend server
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:3001/api/health', {
      method: 'GET',
      timeout: 3000,
    } as any);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Mock API calls for development when backend is down
 */
export const createMockApiResponse = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

/**
 * Development mode error scenarios
 */
export const DevErrorScenarios = {
  // Simulate server crash
  simulateServerCrash: () => {
    throw new Error('ECONNREFUSED: Connection refused to localhost:3001');
  },

  // Simulate timeout
  simulateTimeout: async () => {
    await new Promise(resolve => setTimeout(resolve, 6000));
    throw new Error('Request timeout');
  },

  // Simulate CORS error
  simulateCorsError: () => {
    throw new Error('CORS policy: Cross origin requests are only supported for protocol schemes');
  },

  // Simulate invalid JSON
  simulateParseError: () => {
    throw new Error('Unexpected token < in JSON at position 0');
  },
};

/**
 * Logging utility for network errors
 */
export const logNetworkError = (error: NetworkErrorDetails, context: string) => {
  console.group(`🔴 Network Error in ${context}`);
  console.error('Type:', error.type);
  console.error('Message:', error.message);
  console.warn('Suggestion:', error.suggestion);
  if (error.technicalDetails) {
    console.info('Technical Details:', error.technicalDetails);
  }
  console.groupEnd();
};
