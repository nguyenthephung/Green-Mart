import { 
  uploadProduct, 
  uploadBanner, 
  uploadAvatar, 
  uploadRating,
  deleteFromCloudinary,
  extractPublicId,
  uploadBase64Image 
} from '../config/cloudinary';
import { Request, Response } from 'express';

export class ImageUploadService {
  // Upload single product image
  static uploadProductImage = uploadProduct.single('image');
  
  // Upload multiple product images
  static uploadProductImages = uploadProduct.array('images', 10);
  
  // Upload banner image
  static uploadBannerImage = uploadBanner.single('image');
  
  // Upload avatar image
  static uploadAvatarImage = uploadAvatar.single('avatar');
  
  // Upload rating images
  static uploadRatingImages = uploadRating.array('images', 5);

  // Xóa ảnh từ Cloudinary
  static async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return; // Không phải ảnh Cloudinary, bỏ qua
    }
    
    const publicId = extractPublicId(imageUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }

  // Xóa nhiều ảnh
  static async deleteImages(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map(url => this.deleteImage(url));
    await Promise.all(deletePromises);
  }

  // Upload ảnh từ base64 (cho rich text editor)
  static async uploadBase64(
    base64Data: string, 
    folder: 'products' | 'banners' | 'avatars' | 'ratings' = 'products'
  ): Promise<string> {
    const transformation = {
      products: [{ width: 800, height: 600, crop: 'limit' }, { quality: 'auto' }],
      banners: [{ width: 1200, height: 400, crop: 'limit' }, { quality: 'auto' }],
      avatars: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }, { quality: 'auto' }],
      ratings: [{ width: 600, height: 400, crop: 'limit' }, { quality: 'auto' }]
    };

    return await uploadBase64Image(base64Data, folder, transformation[folder]);
  }

  // Middleware để xử lý lỗi upload
  static handleUploadError = (error: any, req: Request, res: Response, next: any) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File quá lớn. Vui lòng chọn file nhỏ hơn.'
        });
      }
      
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Quá nhiều file. Vui lòng chọn ít file hơn.'
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi upload file'
      });
    }
    next();
  };

  // Helper để lấy URL từ file upload
  static getImageUrl(file: Express.Multer.File): string {
    return (file as any).path || '';
  }

  // Helper để lấy URLs từ multiple files
  static getImageUrls(files: Express.Multer.File[]): string[] {
    return files.map(file => this.getImageUrl(file));
  }
}

export default ImageUploadService;
