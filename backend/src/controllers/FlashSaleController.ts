import { Request, Response } from 'express';
import FlashSale, { IFlashSale } from '../models/FlashSale';
import Product from '../models/Product';

export class FlashSaleController {
  // Lấy tất cả flash sales (admin)
  static async getAllFlashSales(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const flashSales = await FlashSale.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await FlashSale.countDocuments();

      // Populate product information
      const flashSalesWithProducts = await Promise.all(
        flashSales.map(async (flashSale) => {
          const productsWithInfo = await Promise.all(
            flashSale.products.map(async (item) => {
              const product = await Product.findById(item.productId);
              return {
                ...item,
                product: product ? {
                  name: product.name,
                  image: product.image,
                  stock: product.stock
                } : null
              };
            })
          );
          
          return {
            ...flashSale.toObject(),
            products: productsWithInfo
          };
        })
      );

      res.json({
        success: true,
        data: flashSalesWithProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting flash sales:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách flash sale'
      });
    }
  }

  // Lấy flash sales đang hoạt động (public)
  static async getActiveFlashSales(req: Request, res: Response) {
    try {
      const flashSales = await (FlashSale as any).findActiveFlashSales();

      // Populate product information
      const activeFlashSales = await Promise.all(
        flashSales.map(async (flashSale: IFlashSale) => {
          const productsWithInfo = await Promise.all(
            flashSale.products.map(async (item) => {
              const product = await Product.findById(item.productId);
              return {
                productId: item.productId,
                originalPrice: item.originalPrice,
                flashSalePrice: item.flashSalePrice,
                discountPercentage: item.discountPercentage,
                quantity: item.quantity,
                sold: item.sold,
                product: product ? {
                  _id: product._id,
                  name: product.name,
                  image: product.image,
                  stock: product.stock,
                  category: product.category,
                  subCategory: product.subCategory
                } : null
              };
            })
          );

          return {
            ...flashSale.toObject(),
            products: productsWithInfo.filter(item => item.product !== null)
          };
        })
      );

      res.json({
        success: true,
        data: activeFlashSales
      });
    } catch (error) {
      console.error('Error getting active flash sales:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy flash sale đang hoạt động'
      });
    }
  }

  // Lấy flash sales sắp tới (public)
  static async getUpcomingFlashSales(req: Request, res: Response) {
    try {
      const flashSales = await (FlashSale as any).findUpcomingFlashSales();

      // Populate product information
      const upcomingFlashSales = await Promise.all(
        flashSales.map(async (flashSale: IFlashSale) => {
          const productsWithInfo = await Promise.all(
            flashSale.products.map(async (item) => {
              const product = await Product.findById(item.productId);
              return {
                productId: item.productId,
                originalPrice: item.originalPrice,
                flashSalePrice: item.flashSalePrice,
                discountPercentage: item.discountPercentage,
                quantity: item.quantity,
                sold: item.sold,
                product: product ? {
                  _id: product._id,
                  name: product.name,
                  image: product.image,
                  stock: product.stock,
                  category: product.category,
                  subCategory: product.subCategory
                } : null
              };
            })
          );

          return {
            ...flashSale.toObject(),
            products: productsWithInfo.filter(item => item.product !== null)
          };
        })
      );

      res.json({
        success: true,
        data: upcomingFlashSales
      });
    } catch (error) {
      console.error('Error getting upcoming flash sales:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy flash sale sắp tới'
      });
    }
  }

  // Tạo flash sale mới (admin)
  static async createFlashSale(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        startTime,
        endTime,
        products,
        bannerImage,
        priority
      } = req.body;

      // Validate products exist
      const productIds = products.map((p: any) => p.productId);
      const existingProducts = await Product.find({ _id: { $in: productIds } });
      
      if (existingProducts.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Một số sản phẩm không tồn tại'
        });
      }

      // Validate and calculate discount percentages
      const validatedProducts = products.map((item: any) => {
        const product = existingProducts.find(p => (p as any)._id.toString() === item.productId);
        const discountPercentage = Math.round(((product!.price - item.flashSalePrice) / product!.price) * 100);
        
        return {
          ...item,
          originalPrice: product!.price,
          discountPercentage
        };
      });

      const flashSale = new FlashSale({
        name,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        products: validatedProducts,
        bannerImage,
        priority: priority || 0
      });

      await flashSale.save();

      res.status(201).json({
        success: true,
        message: 'Tạo flash sale thành công',
        data: flashSale
      });
    } catch (error) {
      console.error('Error creating flash sale:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo flash sale'
      });
    }
  }

  // Cập nhật flash sale (admin)
  static async updateFlashSale(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Log kiểm tra kiểu dữ liệu và giá trị thời gian
      console.log('DEBUG: updates.startTime:', updates.startTime, 'typeof:', typeof updates.startTime);
      console.log('DEBUG: updates.endTime:', updates.endTime, 'typeof:', typeof updates.endTime);

      // Nếu là string thì chuyển sang Date
      if (updates.startTime && typeof updates.startTime === 'string') {
        updates.startTime = new Date(updates.startTime);
        console.log('DEBUG: startTime sau khi chuyển:', updates.startTime, 'typeof:', typeof updates.startTime);
      }
      if (updates.endTime && typeof updates.endTime === 'string') {
        updates.endTime = new Date(updates.endTime);
        console.log('DEBUG: endTime sau khi chuyển:', updates.endTime, 'typeof:', typeof updates.endTime);
      }

      // Validate flash sale exists
      const existingFlashSale = await FlashSale.findById(id);
      if (!existingFlashSale) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy flash sale'
        });
      }

      // Gán các trường mới vào bản ghi rồi gọi save để validate đúng
      if (updates.products && Array.isArray(updates.products)) {
        const productIds = updates.products.map((p: any) => p.productId);
        const existingProducts = await Product.find({ _id: { $in: productIds } });
        if (existingProducts.length !== productIds.length) {
          return res.status(400).json({
            success: false,
            message: 'Một số sản phẩm không tồn tại'
          });
        }
        // Recalculate discount percentages
        updates.products = updates.products.map((item: any) => {
          const product = existingProducts.find(p => (p as any)._id.toString() === item.productId);
          const discountPercentage = Math.round(((product!.price - item.flashSalePrice) / product!.price) * 100);
          return {
            ...item,
            originalPrice: product!.price,
            discountPercentage: discountPercentage,
            sold: item.sold || 0
          };
        });
      }

      // Gán các trường mới vào bản ghi
      Object.keys(updates).forEach((key) => {
        (existingFlashSale as any)[key] = updates[key];
      });

      // Lưu lại bản ghi để validate đúng
      await existingFlashSale.save();

      res.json({
        success: true,
        message: 'Cập nhật flash sale thành công',
        data: existingFlashSale
      });
    } catch (error) {
      console.error('Error updating flash sale:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật flash sale',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Xóa flash sale (admin)
  static async deleteFlashSale(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const flashSale = await FlashSale.findByIdAndDelete(id);

      if (!flashSale) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy flash sale'
        });
      }

      res.json({
        success: true,
        message: 'Xóa flash sale thành công'
      });
    } catch (error) {
      console.error('Error deleting flash sale:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa flash sale'
      });
    }
  }

  // Toggle trạng thái flash sale (admin)
  static async toggleFlashSaleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const flashSale = await FlashSale.findById(id);

      if (!flashSale) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy flash sale'
        });
      }

      flashSale.isActive = !flashSale.isActive;
      await flashSale.save();

      res.json({
        success: true,
        message: `${flashSale.isActive ? 'Kích hoạt' : 'Tắt'} flash sale thành công`,
        data: flashSale
      });
    } catch (error) {
      console.error('Error toggling flash sale status:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi thay đổi trạng thái flash sale'
      });
    }
  }

  // Kiểm tra sản phẩm có trong flash sale không (public)
  static async checkProductInFlashSale(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const activeFlashSales = await (FlashSale as any).findActiveFlashSales();
      
      for (const flashSale of activeFlashSales) {
        const productInfo = flashSale.getProductInfo(productId);
        if (productInfo) {
          return res.json({
            success: true,
            data: {
              inFlashSale: true,
              flashSale: {
                _id: flashSale._id,
                name: flashSale.name,
                endTime: flashSale.endTime
              },
              productInfo
            }
          });
        }
      }

      res.json({
        success: true,
        data: {
          inFlashSale: false
        }
      });
    } catch (error) {
      console.error('Error checking product in flash sale:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi kiểm tra sản phẩm trong flash sale'
      });
    }
  }
}
