import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
// import { MoMoService } from '../services/momoService';
// import { BankTransferService } from '../services/bankTransferService';

interface GuestOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number;
  image: string;
  unit: string;
}

interface GuestOrderRequest {
  items: GuestOrderItem[];
  guestInfo: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  deliveryType: 'pickup' | 'delivery';
  paymentMethod: 'cod' | 'momo' | 'bank_transfer';
  totalAmount: number;
  shippingFee: number;
  notes?: string;
}

export const createGuestOrder = async (req: Request, res: Response) => {
  try {
    const orderData: GuestOrderRequest = req.body;

    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    if (!orderData.guestInfo || !orderData.guestInfo.name || !orderData.guestInfo.phone || !orderData.guestInfo.address) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin khách hàng không đầy đủ'
      });
    }

    // Validate products exist and calculate total
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of orderData.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${item.name} không tồn tại hoặc không còn bán`
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${item.name} không đủ số lượng trong kho`
        });
      }

      const itemTotal = item.weight ? item.price * item.weight : item.price * item.quantity;
      calculatedTotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        weight: item.weight,
        unit: item.unit,
        image: item.image,
        total: itemTotal
      });
    }

    // Calculate subtotal (items total before shipping)
    const subtotal = calculatedTotal;
    
    // Add shipping fee to get total amount
    calculatedTotal += orderData.shippingFee;

    // Validate total amount (allow small rounding differences)
    if (Math.abs(calculatedTotal - orderData.totalAmount) > 1) {
      return res.status(400).json({
        success: false,
        message: 'Tổng tiền không chính xác'
      });
    }

    // Generate order number
    const orderNumber = `GUEST${Date.now()}`;

    // Create order
    const order = new Order({
      orderNumber,
      user: null, // Guest order
      guestInfo: orderData.guestInfo,
      items: validatedItems,
      subtotal: subtotal, // Required field
      totalAmount: orderData.totalAmount,
      shippingFee: orderData.shippingFee,
      deliveryFee: orderData.shippingFee, // Same as shippingFee
      serviceFee: 0, // No service fee for guest orders
      voucherDiscount: 0, // No voucher for guest orders
      paymentMethod: orderData.paymentMethod,
      deliveryType: orderData.deliveryType,
      status: 'pending',
      paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
      notes: orderData.notes,
      isGuestOrder: true,
      orderDate: new Date()
    });

    await order.save();

    // Update product stock
    for (const item of orderData.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Handle payment processing
    let paymentUrl;
    
    if (orderData.paymentMethod === 'momo') {
      try {
        // TODO: Implement MoMo payment
        /*
        const momoResult = await momoService.createPayment({
          orderId: (order._id as any).toString(),
          orderNumber,
          amount: orderData.totalAmount,
          orderInfo: `Thanh toán đơn hàng ${orderNumber}`,
          customerInfo: {
            name: orderData.guestInfo.name,
            phone: orderData.guestInfo.phone,
            email: orderData.guestInfo.email
          }
        });
        
        if (momoResult.payUrl) {
          paymentUrl = momoResult.payUrl;
          // Update order with payment info
          await Order.findByIdAndUpdate(order._id, {
            paymentInfo: {
              momoTransId: momoResult.transId,
              requestId: momoResult.requestId
            }
          });
        }
        */
      } catch (error) {
        console.error('MoMo payment error:', error);
        // Continue without payment URL, user can pay later
      }
    } else if (orderData.paymentMethod === 'bank_transfer') {
      try {
        // TODO: Implement bank transfer
        /*
        const bankInfo = await bankTransferService.generateTransferInfo({
          orderId: (order._id as any).toString(),
          orderNumber,
          amount: orderData.totalAmount
        });
        
        await Order.findByIdAndUpdate(order._id, {
          paymentInfo: bankInfo
        });
        */
      } catch (error) {
        console.error('Bank transfer info error:', error);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        orderId: (order._id as any).toString(),
        orderNumber,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        paymentUrl
      },
      message: 'Đặt hàng thành công'
    });

  } catch (error) {
    console.error('Create guest order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đơn hàng'
    });
  }
};

export const getGuestOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({ 
      orderNumber, 
      isGuestOrder: true 
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        guestInfo: order.guestInfo,
        items: order.items,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod
      }
    });

  } catch (error) {
    console.error('Get guest order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin đơn hàng'
    });
  }
};
