import { useState } from 'react';

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// Simple file upload service
// In a production app, you would upload to a cloud storage service like AWS S3, Cloudinary, etc.
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    try {
      setIsUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Chỉ chấp nhận file hình ảnh');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Kích thước file không được vượt quá 5MB');
      }

      // For now, convert to base64 for demo purposes
      // In production, you would upload to a server/cloud storage
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          resolve({
            success: true,
            url: base64
          });
        };
        reader.onerror = () => {
          resolve({
            success: false,
            error: 'Lỗi khi đọc file'
          });
        };
        reader.readAsDataURL(file);
      });

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định'
      };
    } finally {
      setIsUploading(false);
    }
  };

  // Upload multiple files
  const uploadFiles = async (files: File[]): Promise<UploadResponse[]> => {
    const results: UploadResponse[] = [];
    
    for (const file of files) {
      const result = await uploadFile(file);
      results.push(result);
    }
    
    return results;
  };

  // Delete file (placeholder for future implementation)
  const deleteFile = async (url: string): Promise<boolean> => {
    try {
      // In production, you would call an API to delete the file
      console.log('Deleting file:', url);
      return true;
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

export default useFileUpload;
