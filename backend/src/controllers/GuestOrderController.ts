import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { PayPalService } from '../services/paypalService';
import { MoMoService } from '../services/momoService';
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
  paymentMethod: 'cod' | 'momo' | 'bank_transfer' | 'paypal';
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
    const paypalService = new PayPalService();
    const momoService = new MoMoService();
    
    if (orderData.paymentMethod === 'paypal') {
      try {
        // Convert VND to USD for PayPal (approximate rate: 1 USD = 24,000 VND)
        const amountUSD = Math.round((orderData.totalAmount / 24000) * 100) / 100;
        
        // Ensure minimum amount for PayPal ($0.01)
        const finalAmountUSD = Math.max(amountUSD, 0.01);
        
        console.log('Creating PayPal order with amount USD:', finalAmountUSD, 'from VND:', orderData.totalAmount);
        
        const paypalOrderRequest = {
          intent: 'CAPTURE' as const,
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: finalAmountUSD.toString()
            },
            description: `Guest Order ${orderNumber}`,
            invoice_id: (order._id as any).toString()
          }],
          application_context: {
            return_url: process.env.PAYPAL_RETURN_URL,
            cancel_url: process.env.PAYPAL_CANCEL_URL,
            brand_name: 'GreenMart',
            landing_page: 'NO_PREFERENCE' as const,
            user_action: 'PAY_NOW' as const
          }
        };
        
        const paypalOrder = await paypalService.createOrder(paypalOrderRequest);
        
        if (paypalOrder.links) {
          const approveLink = paypalOrder.links.find((link: any) => link.rel === 'approve');
          if (approveLink) {
            paymentUrl = approveLink.href;
            
            // Update order with PayPal payment info
            await Order.findByIdAndUpdate(order._id, {
              paymentInfo: {
                paypalOrderId: paypalOrder.id,
                paypalStatus: paypalOrder.status,
                originalAmountVND: orderData.totalAmount,
                convertedAmountUSD: finalAmountUSD
              }
            });
          }
        }
      } catch (error) {
        console.error('PayPal payment error:', error);
        // For debugging - return the error details
        console.log('PayPal order data:', {
          orderId: (order._id as any).toString(),
          amount: orderData.totalAmount,
          amountUSD: Math.round((orderData.totalAmount / 24000) * 100) / 100
        });
      }
    } else if (orderData.paymentMethod === 'momo') {
      try {
        const momoResult = await momoService.createPayment({
          orderId: (order._id as any).toString(),
          amount: orderData.totalAmount,
          orderInfo: `Thanh toán đơn hàng ${orderNumber}`,
          extraData: JSON.stringify({
            guestInfo: orderData.guestInfo,
            orderNumber
          })
        });
        
        if (momoResult.payUrl) {
          paymentUrl = momoResult.payUrl;
          // Update order with payment info
          await Order.findByIdAndUpdate(order._id, {
            paymentInfo: {
              momoTransId: momoResult.requestId,
              requestId: momoResult.requestId,
              momoOrderId: momoResult.orderId
            }
          });
        }
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
