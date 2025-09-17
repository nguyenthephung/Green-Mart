// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://green-mart-api.onrender.com/api' : 'http://localhost:5000/api');

// Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isVerified: boolean;
  avatar?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  joinDate: string;
  lastLogin?: string;
  totalOrders: number;
  totalSpent: number;
  vouchers?: { [voucherId: string]: number }; // New simple structure
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  isGuest?: boolean;
  requireLogin?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// HTTP client utility
export const apiClient = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add token if exists
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    // Kiểm tra xem response có content không
    const contentType = response.headers.get('content-type');
    
    let data;
    // Nếu response có content-type là JSON và có body
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          throw new Error('Server trả về dữ liệu không hợp lệ');
        }
      } else {
        data = { success: false, message: 'Server không trả về dữ liệu' };
      }
    } else {
      // Nếu không phải JSON, tạo response object mặc định
      const text = await response.text();
      data = { 
        success: response.ok, 
        message: response.ok ? 'Thành công' : (text || 'Lỗi server'),
        data: null
      };
    }
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return data;
  } catch (error: any) {
    // Tạo response lỗi chuẩn
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // Đăng ký
  register: async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Đăng nhập
  login: async (credentials: LoginData): Promise<ApiResponse<AuthResponse>> => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Lấy thông tin profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient<User>('/auth/profile');
  },

  // Đăng xuất
  logout: async (): Promise<ApiResponse<null>> => {
    return apiClient<null>('/auth/logout', {
      method: 'POST',
    });
  },

  // Cập nhật profile
  updateProfile: async (data: any): Promise<ApiResponse<User>> => {
    return apiClient<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Token management
export const tokenManager = {
  get: () => localStorage.getItem('token'),
  set: (token: string) => localStorage.setItem('token', token),
  remove: () => localStorage.removeItem('token'),
  exists: () => !!localStorage.getItem('token'),
};