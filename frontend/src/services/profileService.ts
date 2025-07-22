import { authAPI } from './api';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export const profileService = {
  updateProfile: async (data: UpdateProfileData) => {
    try {
      const response = await authAPI.updateProfile(data);
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Cập nhật thông tin thành công',
        errors: response.errors
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Lỗi cập nhật thông tin',
        errors: null
      };
    }
  },

  uploadAvatar: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      return {
        success: response.ok,
        data: data.data,
        message: data.message || 'Tải ảnh thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Lỗi tải ảnh',
        data: null
      };
    }
  }
};
