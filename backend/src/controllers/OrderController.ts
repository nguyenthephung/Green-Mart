import { Request, Response } from 'express';
import Order, { IOrder } from '../models/Order';
import Payment from '../models/Payment';
import Product from '../models/Product';
import Voucher from '../models/Voucher';
import User from '../models/User';
import FlashSale from '../models/FlashSale';
import { Types } from 'mongoose';
import NotificationHelper from '../services/notificationHelper';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  flashSale?: {
    flashSaleId: string;
    isFlashSale: boolean;
    originalPrice: number;
    discountPercentage: number;
  };
}

interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
  };
  paymentMethod: string;
  voucherCode?: string;
  notes?: string;
}

class OrderController {
  // Create a new order
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      interface AuthUser {
        _id: string;
        email?: string;
        // add other user properties if needed
      }
      const user = req.user as AuthUser | undefined;
      const userId = user?._id;
      const { items, shippingAddress, paymentMethod, voucherCode, notes }: CreateOrderRequest = req.body;

      // Require authentication for creating orders
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated - please login to create an order'
        });
        return;
      }

      // Validate products and calculate amounts
      let subtotal = 0;
      let flashSaleDiscount = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          res.status(400).json({
            success: false,
            message: `Product ${item.productId} not found`
          });
          return;
        }

        if (product.stock < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.name}`
          });
          return;
        }

        // Luôn sử dụng giá gốc cho subtotal để thống kê chính xác
        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;

        let flashSaleInfo = null;
        
        // Check if item has Flash Sale info
        if (item.flashSale?.isFlashSale && item.flashSale.flashSaleId) {
          // Validate Flash Sale is still active
          const flashSale = await FlashSale.findById(item.flashSale.flashSaleId);
          if (flashSale && flashSale.isActive) {
            const now = new Date();
            if (flashSale.startTime <= now && flashSale.endTime >= now && flashSale.status === 'active') {
              // Find the product in Flash Sale
              const flashSaleProduct = flashSale.products.find(p => p.productId === item.productId);
              if (flashSaleProduct) {
                const discountAmount = product.price - flashSaleProduct.flashSalePrice;
                const totalDiscountForItem = discountAmount * item.quantity;
                flashSaleDiscount += totalDiscountForItem;
                
                flashSaleInfo = {
                  flashSaleId: item.flashSale.flashSaleId,
                  flashSalePrice: flashSaleProduct.flashSalePrice,
                  discountAmount: discountAmount,
                  discountPercentage: flashSaleProduct.discountPercentage
                };
                
                console.log(`Flash Sale applied for ${product.name}: ${product.price}₫ → ${flashSaleProduct.flashSalePrice}₫ (Discount: ${discountAmount}₫ x ${item.quantity} = ${totalDiscountForItem}₫)`);
              }
            }
          }
        }

        validatedItems.push({
          productId: new Types.ObjectId(item.productId),
          quantity: item.quantity,
          price: product.price, // Giá gốc để thống kê
          name: product.name,
          image: product.images?.[0],
          flashSaleInfo: flashSaleInfo
        });
      }

      // Apply voucher if provided
      let discount = 0;
      let voucherId: Types.ObjectId | null = null;

      if (voucherCode) {
        const voucher = await Voucher.findOne({ 
          code: voucherCode, 
          isActive: true,
          expired: { $gte: new Date().toISOString().split('T')[0] } // Check if not expired (yyyy-mm-dd format)
        });

        if (!voucher) {
          res.status(400).json({
            success: false,
            message: 'Invalid or expired voucher'
          });
          return;
        }

        if (subtotal < voucher.minOrder) {
          res.status(400).json({
            success: false,
            message: `Minimum order value for this voucher is ${voucher.minOrder}`
          });
          return;
        }

        // Calculate discount
        if (voucher.discountType === 'percent') {
          // For percentage: discount = percentage of subtotal
          const percentDiscount = (subtotal * voucher.discountValue) / 100;
          discount = Math.min(percentDiscount, subtotal); // Cannot exceed subtotal
        } else {
          // For fixed amount: discount = fixed value, but cannot exceed subtotal
          discount = Math.min(voucher.discountValue, subtotal);
        }

        console.log('OrderController - Voucher calculation:', {
          voucherCode: voucher.code,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          subtotal,
          calculatedDiscount: discount
        });

        voucherId = voucher._id as Types.ObjectId;

        // Check if user has this voucher
        const userWithVoucher = await User.findById(userId);
        if (!userWithVoucher) {
          res.status(400).json({
            success: false,
            message: 'User not found'
          });
          return;
        }

        // Check if user has this voucher with the new simple structure
        const userVoucherQuantity = userWithVoucher.vouchers?.[voucherId!.toString()] || 0;

        if (userVoucherQuantity <= 0) {
          res.status(400).json({
            success: false,
            message: 'You do not have this voucher or it has been used up'
          });
          return;
        }

        // Decrease voucher quantity for user
        if (!userWithVoucher.vouchers) {
          userWithVoucher.vouchers = {};
        }
        
        if (userVoucherQuantity === 1) {
          // Remove voucher completely if quantity becomes 0
          delete userWithVoucher.vouchers[voucherId!.toString()];
        } else {
          // Decrease quantity by 1
          userWithVoucher.vouchers[voucherId!.toString()] = userVoucherQuantity - 1;
        }

        console.log('OrderController - Updated user vouchers:', userWithVoucher.vouchers);

        // IMPORTANT: Mark vouchers field as modified for Mongoose Mixed type
        userWithVoucher.markModified('vouchers');

        await userWithVoucher.save();

        // Update voucher usage statistics
        await Voucher.findByIdAndUpdate(
          voucherId,
          { $inc: { currentUsage: 1 } },
          { new: true }
        );
      }

      // Calculate shipping (simple flat rate for demo)
      const shippingFee = subtotal >= 300000 ? 0 : 30000; // Free shipping for orders >= 300k VND

      // Calculate final total: subtotal - voucherDiscount - flashSaleDiscount + shipping
      const totalAmount = subtotal - discount - flashSaleDiscount + shippingFee;

      console.log('OrderController - Final calculation:', {
        subtotal,
        voucherDiscount: discount,
        flashSaleDiscount,
        shippingFee,
        totalAmount,
        voucherCode,
        voucherId: voucherId?.toString()
      });

      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Create order
      const order = new Order({
        orderNumber,
        userId: new Types.ObjectId(userId), // Sử dụng userId thực của user đã đăng nhập
        customerName: shippingAddress.fullName,
        customerEmail: user.email, // Sử dụng email thực của user
        customerPhone: shippingAddress.phone,
        customerAddress: `${shippingAddress.address}, ${shippingAddress.ward}, ${shippingAddress.district}, ${shippingAddress.province}`,
        items: validatedItems.map(item => ({
          productId: item.productId,
          productName: item.name, // Map name to productName
          quantity: item.quantity,
          price: item.price, // Giá gốc để thống kê
          image: item.image,
          flashSaleInfo: item.flashSaleInfo
        })),
        subtotal,
        deliveryFee: shippingFee,
        serviceFee: 0, // Add if needed
        voucherDiscount: discount,
        voucherCode: voucherCode || undefined,
        flashSaleDiscount: flashSaleDiscount,
        totalAmount,
        paymentMethod,
        paymentStatus: 'unpaid',
        // Trạng thái order phụ thuộc vào phương thức thanh toán
        status: paymentMethod === 'momo' || paymentMethod === 'paypal' ? 'pending' : 'pending', // Tất cả đều bắt đầu từ pending
        orderDate: new Date(),
        notes: notes || undefined
      });

      await order.save();

      // Update product stock and Flash Sale count
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );
        
        // Update Flash Sale count if applicable
        if (item.flashSaleInfo?.flashSaleId) {
          try {
            const flashSale = await FlashSale.findById(item.flashSaleInfo.flashSaleId);
            if (flashSale) {
              const flashSaleProduct = flashSale.products.find(p => p.productId === item.productId.toString());
              if (flashSaleProduct) {
                flashSaleProduct.sold = (flashSaleProduct.sold || 0) + item.quantity;
                await flashSale.save();
                console.log(`Updated Flash Sale count for product ${item.productId}: sold +${item.quantity}`);
              }
            }
          } catch (flashSaleError) {
            console.error('Error updating Flash Sale count:', flashSaleError);
            // Don't fail the order if Flash Sale update fails
          }
        }
      }

      // Create notifications for order creation - ONLY for offline payment methods
      // For online payments (PayPal, MoMo), notifications will be created after payment confirmation
      const offlinePaymentMethods = ['cod', 'bank_transfer', 'cash'];
      if (offlinePaymentMethods.includes(paymentMethod.toLowerCase())) {
        try {
          await NotificationHelper.notifyOrderCreated(userId, order);
          console.log('Order notification created for offline payment method:', paymentMethod);
        } catch (notificationError) {
          console.error('Error creating order notifications:', notificationError);
          // Don't fail the order creation if notification fails
        }
      } else {
        console.log('Skipping notification for online payment method:', paymentMethod, '- will create after payment confirmation');
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod
        }
      });

    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Public order tracking (no authentication required)
  async trackOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      
      console.log('Tracking order (public):', orderId);

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
        return;
      }

      const order = await Order.findById(orderId)
        .select('-__v -updatedAt')
        .lean();

      if (!order) {
        console.log('Order not found:', orderId);
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      console.log('Order found for tracking, sending response');
      res.json({
        success: true,
        data: order
      });

    } catch (error) {
      console.error('Track order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get order details (authenticated)
  async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?._id;

      console.log('Getting order:', orderId, 'for user:', userId);

      // First, find the order without populate to avoid errors
      const order = await Order.findById(orderId);

      if (!order) {
        console.log('Order not found:', orderId);
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Check if order belongs to user (skip for guest orders)
      if (order.userId && order.userId.toString() !== userId) {
        console.log('Unauthorized access - Order userId:', order.userId, 'Request userId:', userId);
        res.status(403).json({
          success: false,
          message: 'Unauthorized access to order'
        });
        return;
      }

      console.log('Order found and authorized, sending response');
      res.json({
        success: true,
        data: order
      });

    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get user's order history
  async getOrderHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { page = 1, limit = 20, status, paymentStatus } = req.query;

      console.log('Getting order history for user:', userId);

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const query: any = { userId };
      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;

      console.log('Order query:', query);

      // First, get orders without populate to avoid errors
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      console.log('Found orders count:', orders.length);

      const total = await Order.countDocuments(query);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get order history error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update order status
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const userId = req.user?._id;

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // For admin, skip ownership check - admin can update any order
      // For regular users, check if they own the order
      const isOwner = order.userId ? order.userId.toString() === userId : false;
      // Note: You might want to add proper admin role checking here
      // For now, we'll allow any authenticated user to update orders (admin behavior)
      
      // Validate status transition - Allow more flexible transitions for admin
      const validTransitions: Record<string, string[]> = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['preparing', 'shipping', 'delivered', 'cancelled'], // Allow direct delivery
        'preparing': ['shipping', 'delivered', 'cancelled'], // Allow direct delivery
        'shipping': ['delivered', 'cancelled'],
        'delivered': ['completed'], // Delivered orders can only be marked as completed
        'cancelled': [], // Cancelled orders cannot be changed
        'completed': [], // Completed orders cannot be changed
        'returned': []
      };

      // Don't allow changing from final states (delivered, cancelled, completed, returned)
      if (['delivered', 'cancelled', 'completed', 'returned'].includes(order.status) && 
          order.status !== status) {
        res.status(400).json({
          success: false,
          message: `Cannot change status from ${order.status} to ${status}. Final states cannot be modified.`
        });
        return;
      }

      if (!validTransitions[order.status].includes(status)) {
        res.status(400).json({
          success: false,
          message: `Cannot change status from ${order.status} to ${status}`
        });
        return;
      }

      order.status = status;
      
      // Set delivery date if delivered
      if (status === 'delivered') {
        order.deliveryDate = new Date();
      }

      // Update payment status based on payment method and new status
      if (status === 'delivered' && order.paymentMethod === 'cod') {
        // COD: payment is received when order is delivered
        order.paymentStatus = 'paid';
      } else if (status === 'confirmed') {
        // When confirming orders:
        if (order.paymentMethod === 'bank_transfer') {
          // Bank Transfer: payment is confirmed when admin confirms the order
          order.paymentStatus = 'paid';
        } else if (order.paymentMethod === 'momo') {
          // MoMo: If order is confirmed, it means payment was successful
          // (payment would have been processed during checkout)
          order.paymentStatus = 'paid';
        } else if (order.paymentMethod === 'paypal') {
          // PayPal: If order is confirmed, it means payment was successful
          // (payment would have been processed during checkout)
          order.paymentStatus = 'paid';
        }
        // COD: payment status remains 'pending' until delivery
        // PayPal: usually auto-confirmed during payment processing
      }
      // Note: MoMo and PayPal payments are processed immediately during checkout,
      // so confirming the order means payment was successful

      await order.save();

      // Create notification for status change (only for authenticated users)
      try {
        if (order.userId) {
          await NotificationHelper.notifyOrderStatusChanged(order.userId.toString(), order, status);
        }
      } catch (notificationError) {
        console.error('Error creating order status notification:', notificationError);
        // Don't fail the status update if notification fails
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { orderId: order._id, status: order.status }
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Cancel order
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const userId = req.user?._id;

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Check permission (skip for guest orders - they shouldn't access this endpoint)
      if (order.userId && order.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized access to order'
        });
        return;
      }

      // Check if order can be cancelled
      if (!['pending', 'confirmed', 'preparing'].includes(order.status)) {
        res.status(400).json({
          success: false,
          message: 'Order cannot be cancelled at this stage'
        });
        return;
      }

      // Update order status
      order.status = 'cancelled';
      order.notes = (order.notes || '') + `\nCancelled: ${reason || 'No reason provided'}`;
      await order.save();

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        );
      }

      // Handle payment refund if paid
      if (order.paymentStatus === 'paid' && order.paymentId) {
        const payment = await Payment.findById(order.paymentId);
        if (payment && payment.status === 'completed') {
          // This would trigger a refund process
          // For now, just update the payment status
          payment.status = 'refunded';
          await payment.save();
          
          order.paymentStatus = 'refunded';
          await order.save();
        }
      }

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: { orderId: order._id, status: order.status }
      });

    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Admin: Get all orders
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status, paymentStatus, paymentMethod, startDate, endDate } = req.query;

      const query: any = {};
      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (paymentMethod) query.paymentMethod = paymentMethod;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      const orders = await Order.find(query)
        .populate({
          path: 'userId',
          select: 'name email phone',
          // Don't fail if userId is null (for guest orders)
          options: { lean: true }
        })
        .populate({
          path: 'items.productId',
          select: 'name images price category',
          options: { lean: true }
        })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean(); // Use lean for better performance

      const total = await Order.countDocuments(query);

      res.json({
        success: true,
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Admin: Get orders pending confirmation
  async getPendingOrders(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;

      // Get orders that need admin confirmation (pending status with COD or bank_transfer)
      const query = {
        status: 'pending',
        paymentMethod: { $in: ['cod', 'bank_transfer'] }
      };

      const orders = await Order.find(query)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Order.countDocuments(query);

      res.json({
        success: true,
        message: 'Pending orders retrieved successfully',
        data: {
          orders,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get pending orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Generate unique order number
  private async generateOrderNumber(): Promise<string> {
    const prefix = 'GM';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    let orderNumber = `${prefix}${timestamp}${random}`;
    
    // Ensure uniqueness
    let exists = await Order.findOne({ orderNumber });
    while (exists) {
      const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      orderNumber = `${prefix}${timestamp}${newRandom}`;
      exists = await Order.findOne({ orderNumber });
    }
    
    return orderNumber;
  }

  // Get order statistics (for admin dashboard)
  async getOrderStats(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30d' } = req.query;
      
      let startDate = new Date();
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      const [
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue,
        ordersInPeriod
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'completed' }),
        Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing', 'shipping'] } }),
        Order.countDocuments({ status: 'cancelled' }),
        Order.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.countDocuments({ createdAt: { $gte: startDate } })
      ]);

      res.json({
        success: true,
        data: {
          totalOrders,
          completedOrders,
          pendingOrders,
          cancelledOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          ordersInPeriod,
          period
        }
      });

    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new OrderController();
