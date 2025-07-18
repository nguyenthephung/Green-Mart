// API configuration
const API_BASE_URL = '/api';

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
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// HTTP client utility
const apiClient = async <T>(
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
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
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
};

// Token management
export const tokenManager = {
  get: () => localStorage.getItem('token'),
  set: (token: string) => localStorage.setItem('token', token),
  remove: () => localStorage.removeItem('token'),
  exists: () => !!localStorage.getItem('token'),
};
