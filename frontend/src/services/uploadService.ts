const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    imageUrl: string;
  } | {
    imageUrls: string[];
  };
}

// Helper function for upload requests
const uploadRequest = async (endpoint: string, formData: FormData): Promise<UploadResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Helper function for JSON requests  
const jsonRequest = async (endpoint: string, method: string, data?: any): Promise<any> => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

class UploadService {
  // Upload single product image
  async uploadProductImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return uploadRequest('/upload/product/single', formData);
  }

  // Upload multiple product images
  async uploadProductImages(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return uploadRequest('/upload/product/multiple', formData);
  }

  // Upload banner image
  async uploadBannerImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return uploadRequest('/upload/banner', formData);
  }

  // Upload avatar image
  async uploadAvatarImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    return uploadRequest('/upload/avatar', formData);
  }

  // Upload rating images
  async uploadRatingImages(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return uploadRequest('/upload/rating', formData);
  }

  // Upload base64 image
  async uploadBase64(imageData: string, type: 'products' | 'banners' | 'avatars' | 'ratings'): Promise<UploadResponse> {
    return jsonRequest(`/upload/base64/${type}`, 'POST', { imageData });
  }

  // Delete image
  async deleteImage(imageUrl: string): Promise<{ success: boolean; message: string }> {
    const encodedUrl = encodeURIComponent(imageUrl);
    return jsonRequest(`/upload/${encodedUrl}`, 'DELETE');
  }
}

export const uploadService = new UploadService();
export default uploadService;
