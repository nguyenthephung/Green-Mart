import { create } from 'zustand';
import adminUserService from '../services/adminUserService';
import type { User, UserStats, UserFilter, CreateUserRequest } from '../services/adminUserService';

interface AdminUserState {
  // Data
  users: User[];
  selectedUser: User | null;
  stats: UserStats | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;

  // Filters
  currentFilter: UserFilter;

  // UI State
  loading: boolean;
  error: string | null;
  loadingStats: boolean;

  // Actions
  fetchUsers: (filter?: UserFilter) => Promise<void>;
  fetchUserById: (userId: string) => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<void>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<void>;
  fetchUserStats: () => Promise<void>;

  // Utility
  setFilter: (filter: UserFilter) => void;
  clearError: () => void;
  clearSelectedUser: () => void;
}

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  // Initial state
  users: [],
  selectedUser: null,
  stats: null,
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  hasNext: false,
  hasPrev: false,
  currentFilter: {},
  loading: false,
  error: null,
  loadingStats: false,

  // Fetch users with filtering and pagination
  fetchUsers: async (filter = {}) => {
    const state = get();
    set({ loading: true, error: null });

    try {
      const mergedFilter = { ...state.currentFilter, ...filter };
      const response = await adminUserService.getAllUsers(mergedFilter);

      set({
        users: response.data.users,
        currentPage: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages,
        totalUsers: response.data.pagination.total,
        hasNext: response.data.pagination.hasNext,
        hasPrev: response.data.pagination.hasPrev,
        currentFilter: mergedFilter,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Lỗi khi tải danh sách người dùng',
      });
    }
  },

  // Fetch user by ID
  fetchUserById: async (userId: string) => {
    set({ loading: true, error: null });

    try {
      const user = await adminUserService.getUserById(userId);
      set({
        selectedUser: user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Lỗi khi tải thông tin người dùng',
      });
    }
  },

  // Create new user
  createUser: async (userData: CreateUserRequest) => {
    set({ loading: true, error: null });

    try {
      const newUser = await adminUserService.createUser(userData);

      // Instead of optimistic update, refresh the entire list to ensure consistency
      const state = get();
      await state.fetchUsers(); // This will refresh the users list

      set({ loading: false, error: null });
      return newUser;
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Lỗi khi tạo người dùng mới',
      });
      throw error;
    }
  },

  // Update user
  updateUser: async (userId: string, updates: Partial<User>) => {
    set({ loading: true, error: null });

    try {
      const updatedUser = await adminUserService.updateUser(userId, updates);

      const state = get();
      const updatedUsers = state.users.map(user => (user._id === userId ? updatedUser : user));

      set({
        users: updatedUsers,
        selectedUser: state.selectedUser?._id === userId ? updatedUser : state.selectedUser,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Lỗi khi cập nhật thông tin người dùng',
      });
    }
  },

  // Delete user
  deleteUser: async (userId: string) => {
    set({ loading: true, error: null });

    try {
      await adminUserService.deleteUser(userId);

      const state = get();
      const filteredUsers = state.users.filter(user => user._id !== userId);

      set({
        users: filteredUsers,
        selectedUser: state.selectedUser?._id === userId ? null : state.selectedUser,
        totalUsers: state.totalUsers - 1,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Lỗi khi xóa người dùng',
      });
    }
  },

  // Update user status
  updateUserStatus: async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    set({ loading: true, error: null });

    try {
      const updatedUser = await adminUserService.updateUserStatus(userId, status);

      const state = get();
      const updatedUsers = state.users.map(user => (user._id === userId ? updatedUser : user));

      set({
        users: updatedUsers,
        selectedUser: state.selectedUser?._id === userId ? updatedUser : state.selectedUser,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Lỗi khi cập nhật trạng thái người dùng',
      });
    }
  },

  // Reset user password
  resetUserPassword: async (userId: string, newPassword: string) => {
    set({ loading: true, error: null });

    try {
      await adminUserService.resetUserPassword(userId, newPassword);
      set({
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Lỗi khi đặt lại mật khẩu',
      });
    }
  },

  // Fetch user statistics
  fetchUserStats: async () => {
    set({ loadingStats: true, error: null });

    try {
      const stats = await adminUserService.getUserStats();
      set({
        stats,
        loadingStats: false,
        error: null,
      });
    } catch (error: any) {
      set({
        loadingStats: false,
        error: error.message || 'Lỗi khi tải thống kê người dùng',
      });
    }
  },

  // Set filter
  setFilter: (filter: UserFilter) => {
    set({ currentFilter: filter });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear selected user
  clearSelectedUser: () => {
    set({ selectedUser: null });
  },
}));
