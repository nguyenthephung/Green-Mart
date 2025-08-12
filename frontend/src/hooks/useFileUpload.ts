import { useState } from 'react';
import { uploadService } from '../services/uploadService';

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// Enhanced file upload service with Cloudinary integration
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (
    file: File, 
    type: 'products' | 'banners' | 'avatars' | 'ratings' = 'products'
  ): Promise<UploadResponse> => {
    try {
      setIsUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Chỉ chấp nhận file hình ảnh');
      }

      // Validate file size based on type
      const maxSizes = {
        products: 5 * 1024 * 1024, // 5MB
        banners: 10 * 1024 * 1024, // 10MB  
        avatars: 2 * 1024 * 1024, // 2MB
        ratings: 3 * 1024 * 1024, // 3MB
      };

      if (file.size > maxSizes[type]) {
        throw new Error(`Kích thước file không được vượt quá ${maxSizes[type] / (1024 * 1024)}MB`);
      }

      // Try to upload to Cloudinary first
      let response;
      try {
        switch (type) {
          case 'products':
            response = await uploadService.uploadProductImage(file);
            break;
          case 'banners':
            response = await uploadService.uploadBannerImage(file);
            break;
          case 'avatars':
            response = await uploadService.uploadAvatarImage(file);
            break;
          case 'ratings':
            response = await uploadService.uploadRatingImages([file]);
            break;
          default:
            response = await uploadService.uploadProductImage(file);
        }

        if (response.success) {
          return {
            success: true,
            url: (response.data as any).imageUrl || (response.data as any).imageUrls?.[0]
          };
        } else {
          throw new Error(response.message || 'Upload failed');
        }
      } catch (cloudinaryError: any) {
        console.warn('Cloudinary upload failed, falling back to base64:', cloudinaryError.message);
        
        // Fallback to base64 for demo purposes
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            resolve({
              success: true,
              url: base64
            });
          };
          reader.onerror = () => {
            reject(new Error('Lỗi đọc file'));
          };
          reader.readAsDataURL(file);
        });
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Lỗi upload file'
      };
    } finally {
      setIsUploading(false);
    }
  };

  // Upload multiple files
  const uploadFiles = async (files: File[], type: 'products' | 'banners' | 'avatars' | 'ratings' = 'products'): Promise<UploadResponse[]> => {
    const results: UploadResponse[] = [];
    for (const file of files) {
      const result = await uploadFile(file, type);
      results.push(result);
    }
    return results;
  };

  // Delete file from Cloudinary
  const deleteFile = async (url: string): Promise<boolean> => {
    try {
      if (url.includes('cloudinary.com')) {
        await uploadService.deleteImage(url);
        return true;
      }
      return true; // Base64 images don't need deletion
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  };

  return {
    uploadFile,
    uploadFiles,
    deleteFile,
    isUploading
  };
};

// Utility to check if file is valid image
export const isValidImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

// Utility to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};