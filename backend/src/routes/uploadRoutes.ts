import { Router, Request, Response, NextFunction } from 'express';
import ImageUploadService from '../services/imageUploadService';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Test route (no auth required)
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Upload service is working',
    cloudinary: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvbo6qxz4',
      configured: true
    }
  });
});

// Upload single product image
router.post('/product/single', 
  authenticate,
  ImageUploadService.uploadProductImage,
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
      return;
    }
    const imageUrl = ImageUploadService.getImageUrl(req.file);
    res.json({
      success: true,
      message: 'Upload ảnh sản phẩm thành công',
      data: { imageUrl }
    });
  }
);

// Upload multiple product images
router.post('/product/multiple',
  authenticate,
  ImageUploadService.uploadProductImages,
  (req: Request, res: Response): void => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
      return;
    }
    const imageUrls = ImageUploadService.getImageUrls(req.files as Express.Multer.File[]);
    res.json({
      success: true,
      message: 'Upload nhiều ảnh sản phẩm thành công',
      data: { imageUrls }
    });
  }
);

// Upload banner image
router.post('/banner',
  authenticate,
  ImageUploadService.uploadBannerImage,
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
      return;
    }
    const imageUrl = ImageUploadService.getImageUrl(req.file);
    res.json({
      success: true,
      message: 'Upload ảnh banner thành công',
      data: { imageUrl }
    });
  }
);

// Upload avatar image
router.post('/avatar',
  authenticate,
  ImageUploadService.uploadAvatarImage,
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
      return;
    }
    const imageUrl = ImageUploadService.getImageUrl(req.file);
    console.log('[Avatar Upload] imageUrl:', imageUrl);
    res.json({
      success: true,
      message: 'Upload ảnh avatar thành công',
      data: { imageUrl }
    });
  }
);

// Upload rating images
router.post('/rating',
  authenticate,
  ImageUploadService.uploadRatingImages,
  (req: Request, res: Response): void => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
      return;
    }
    const imageUrls = ImageUploadService.getImageUrls(req.files as Express.Multer.File[]);
    res.json({
      success: true,
      message: 'Upload ảnh rating thành công',
      data: { imageUrls }
    });
  }
);

// Upload base64 image
router.post('/base64/:type',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      const { imageData } = req.body;
      if (!imageData) {
        res.status(400).json({
          success: false,
          message: 'Không có dữ liệu ảnh'
        });
        return;
      }
      const validTypes = ['products', 'banners', 'avatars', 'ratings'];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Loại ảnh không hợp lệ'
        });
        return;
      }
      const imageUrl = await ImageUploadService.uploadBase64(
        imageData, 
        type as 'products' | 'banners' | 'avatars' | 'ratings'
      );
      res.json({
        success: true,
        message: `Upload ảnh ${type} thành công`,
        data: { imageUrl }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi upload ảnh base64'
      });
    }
  }
);

// Test upload without auth (for development only)
router.post('/test/product', 
  ImageUploadService.uploadProductImage,
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
      return;
    }
    const imageUrl = ImageUploadService.getImageUrl(req.file);
    res.json({
      success: true,
      message: 'Test upload thành công',
      data: { imageUrl },
      file: {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  }
);

// Delete image
router.delete('/:imageUrl',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { imageUrl } = req.params;
      const decodedUrl = decodeURIComponent(imageUrl);
      if (!decodedUrl) {
        res.status(400).json({
          success: false,
          message: 'Thiếu URL của ảnh'
        });
        return;
      }
      await ImageUploadService.deleteImage(decodedUrl);
      res.json({
        success: true,
        message: 'Xóa ảnh thành công'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi xóa ảnh'
      });
    }
  }
);


// Global error handler for upload errors
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  ImageUploadService.handleUploadError(err, req, res, next);
});

export default router;
