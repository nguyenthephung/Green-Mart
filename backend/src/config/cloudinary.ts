import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvbo6qxz4',
  api_key: process.env.CLOUDINARY_API_KEY || '714992923528963',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'GSdZB_HkxoiBP8CZ1zdrXHc5LeA',
});

// Cấu hình storage cho Product images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'greenmart/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' }, // Giới hạn kích thước để tối ưu
      { quality: 'auto' }, // Tự động tối ưu chất lượng
      { fetch_format: 'auto' } // Tự động chọn format tốt nhất
    ]
  } as any,
});

// Cấu hình storage cho Banner images
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'greenmart/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1920, height: 600, crop: 'limit' }, // Tăng kích thước cho hero banner
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  } as any,
});

// Cấu hình storage cho User avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'greenmart/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  } as any,
});

// Cấu hình storage cho Rating images
const ratingStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'greenmart/ratings',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 600, height: 400, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  } as any,
});

// Tạo middleware upload cho từng loại
export const uploadProduct = multer({ 
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const uploadBanner = multer({ 
  storage: bannerStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

export const uploadRating = multer({ 
  storage: ratingStorage,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});

// Utility functions
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  // ...existing code...
  } catch (error) {
    console.error(`❌ Error deleting image from Cloudinary: ${publicId}`, error);
    throw error;
  }
};

export const extractPublicId = (imageUrl: string): string => {
  // Extract public_id from Cloudinary URL
  // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
  const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\./);
  return matches ? matches[1] : '';
};

export const uploadBase64Image = async (
  base64Data: string, 
  folder: string,
  transformation?: any
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: `greenmart/${folder}`,
      transformation: transformation || [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading base64 image to Cloudinary:', error);
    throw error;
  }
};

export { cloudinary };
export default cloudinary;
