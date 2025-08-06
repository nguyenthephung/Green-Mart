export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  position: 'hero' | 'sidebar' | 'footer' | 'category' | 'promo' | 'sale' | 'featured';
  categoryId?: string; // For category-specific banners
  priority: number;
  startDate: string;
  endDate?: string;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerData {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  position: 'hero' | 'sidebar' | 'footer' | 'category' | 'promo' | 'sale' | 'featured';
  categoryId?: string; // For category-specific banners
  priority: number;
  startDate: string;
  endDate?: string;
}

export interface UpdateBannerData extends Partial<CreateBannerData> {
  isActive?: boolean;
}

export interface BannerStats {
  byPosition: Array<{
    _id: string;
    count: number;
    totalClicks: number;
    activeCount: number;
  }>;
  overall: {
    totalBanners: number;
    totalClicks: number;
    activeBanners: number;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class BannerService {
  // Get all banners (public)
  async getAllBanners(position?: string, isActive?: boolean): Promise<Banner[]> {
    try {
      const params = new URLSearchParams();
      if (position) params.append('position', position);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      
      const response = await fetch(`${API_BASE_URL}/banners?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to fetch banners');
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  }

  // Get banner by ID (public)
  async getBannerById(id: string): Promise<Banner> {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/${id}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to fetch banner');
    } catch (error) {
      console.error('Error fetching banner:', error);
      throw error;
    }
  }

  // Create banner (admin only)
  async createBanner(bannerData: CreateBannerData): Promise<Banner> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/banners`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bannerData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to create banner');
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  }

  // Update banner (admin only)
  async updateBanner(id: string, updateData: UpdateBannerData): Promise<Banner> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to update banner');
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  }

  // Delete banner (admin only)
  async deleteBanner(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  }

  // Toggle banner status (admin only)
  async toggleBannerStatus(id: string): Promise<Banner> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/banners/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to toggle banner status');
    } catch (error) {
      console.error('Error toggling banner status:', error);
      throw error;
    }
  }

  // Increment click count (public)
  async incrementClickCount(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/banners/${id}/click`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error incrementing click count:', error);
      // Don't throw error for click tracking as it's not critical
    }
  }

  // Get banner statistics (admin only)
  async getBannerStats(): Promise<BannerStats> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/banners/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to fetch banner stats');
    } catch (error) {
      console.error('Error fetching banner stats:', error);
      throw error;
    }
  }
}

export default new BannerService();
