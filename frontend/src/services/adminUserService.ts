import { apiClient } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Optional since we don't usually return password
  avatar: string;
  role: 'user' | 'admin' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  isVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  vouchers?: { [voucherId: string]: number };
  joinDate: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
  usersByRole: Array<{ _id: string; count: number }>;
}

export interface UserResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

export interface UserFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'admin' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  isVerified?: boolean;
}

class AdminUserService {
  // Get all users with filtering and pagination
  async getAllUsers(filter: UserFilter = {}): Promise<UserResponse> {
    try {
      const params = new URLSearchParams();
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.search) params.append('search', filter.search);
      if (filter.role) params.append('role', filter.role);
      if (filter.status) params.append('status', filter.status);

      const response = await apiClient(`/users/admin/all?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        return response as UserResponse;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error getting users:', error);
      throw new Error(error.message || 'Lỗi khi lấy danh sách người dùng');
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await apiClient(`/users/admin/${userId}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        return response.data as User;
      } else {
        throw new Error('User not found');
      }
    } catch (error: any) {
      console.error('Error getting user:', error);
      throw new Error(error.message || 'Lỗi khi lấy thông tin người dùng');
    }
  }

  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const response = await apiClient(`/users/admin/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response.success && response.data) {
        return response.data as User;
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.message || 'Lỗi khi cập nhật thông tin người dùng');
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await apiClient(`/users/admin/${userId}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error('Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.message || 'Lỗi khi xóa người dùng');
    }
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await apiClient<{ data: User }>('/users/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.success) {
        throw new Error(response.message || 'Không thể tạo người dùng');
      }

      return response.data!.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Không thể tạo người dùng');
    }
  }

  // Update user status
  async updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<User> {
    try {
      const response = await apiClient(`/users/admin/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (response.success && response.data) {
        return response.data as User;
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (error: any) {
      console.error('Error updating user status:', error);
      throw new Error(error.message || 'Lỗi khi cập nhật trạng thái người dùng');
    }
  }

  // Reset user password
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient(`/users/admin/${userId}/reset-password`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword }),
      });

      if (!response.success) {
        throw new Error('Failed to reset password');
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw new Error(error.message || 'Lỗi khi đặt lại mật khẩu');
    }
  }

  // Get user statistics
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await apiClient('/users/admin/stats', {
        method: 'GET',
      });

      if (response.success && response.data) {
        return response.data as UserStats;
      } else {
        throw new Error('Failed to get user statistics');
      }
    } catch (error: any) {
      console.error('Error getting user stats:', error);
      throw new Error(error.message || 'Lỗi khi lấy thống kê người dùng');
    }
  }
}

export default new AdminUserService();
