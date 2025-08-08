import { Request, Response } from 'express';
import Order, { IOrder } from '../models/Order';
import Payment, { IPayment } from '../models/Payment';
import { MoMoService } from '../services/momoService';
import { BankTransferService } from '../services/bankTransferService';
import { PayPalService } from '../services/paypalService';
import NotificationHelper from '../services/notificationHelper';

export class PaymentController {
  private momoService: MoMoService;
  private bankTransferService: BankTransferService;
  private paypalService: PayPalService;

  constructor() {
    this.momoService = new MoMoService();
    this.bankTransferService = new BankTransferService();
    this.paypalService = new PayPalService();
  }

  // Tạo thanh toán
  async createPayment(req: Request, res: Response) {
    try {
      const { orderId, paymentMethod, amount, returnUrl } = req.body;

      console.log('PaymentController createPayment received:', {
        orderId,
        paymentMethod,
        amount,
        returnUrl
      });

      // Validate input
      if (!orderId || !paymentMethod || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: orderId, paymentMethod, amount'
        });
      }

      // Kiểm tra order tồn tại
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      console.log('PaymentController found order:', {
        orderId: order._id,
        totalAmount: order.totalAmount,
        voucherDiscount: order.voucherDiscount,
        subtotal: order.subtotal,
        requestedAmount: amount
      });

      let paymentResult;

      switch (paymentMethod.toLowerCase()) {
        case 'cod':
          paymentResult = await this.processCOD(order, amount);
          break;
        case 'momo':
          if (!returnUrl) {
            return res.status(400).json({
              success: false,
              message: 'Return URL required for MoMo payment'
            });
          }
          paymentResult = await this.processMoMo(order, amount, returnUrl);
          break;
        case 'bank_transfer':
        case 'banktransfer':
          paymentResult = await this.processBankTransfer(order, amount);
          break;
        case 'paypal':
          if (!returnUrl) {
            return res.status(400).json({
              success: false,
              message: 'Return URL required for PayPal payment'
            });
          }
          paymentResult = await this.processPayPal(order, amount, returnUrl);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Unsupported payment method. Supported methods: cod, momo, bank_transfer, paypal'
          });
      }

      res.json(paymentResult);
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  // Xử lý thanh toán COD
  private async processCOD(order: any, amount: number) {
    try {
      // Sử dụng totalAmount từ order thay vì amount từ request
      const actualAmount = order.totalAmount;
      
      console.log('PaymentController processCOD:');
      console.log('Request amount:', amount);
      console.log('Order totalAmount:', actualAmount);
      console.log('Using order totalAmount for payment record');
      
      // Tạo payment record với trạng thái pending - chờ admin xác nhận
      const payment = new Payment({
        orderId: order._id,
        userId: order.userId,
        paymentMethod: 'cod',
        amount: actualAmount, // Sử dụng order.totalAmount
        status: 'pending', // Chờ admin xác nhận khi giao hàng
        transactionId: `COD_${order._id}_${Date.now()}`
      });

      await payment.save();

      // Cập nhật trạng thái order - chờ xác nhận
      order.paymentStatus = 'unpaid';
      order.paymentMethod = 'cod';
      order.status = 'pending'; // Chờ admin xác nhận
      await order.save();

      return {
        success: true,
        message: 'COD order created successfully - waiting for admin confirmation',
        paymentId: payment._id,
        paymentMethod: 'COD',
        status: 'pending',
        transactionId: payment.transactionId,
        note: 'Đơn hàng đã được tạo và đang chờ xác nhận từ admin'
      };
    } catch (error) {
      console.error('COD processing error:', error);
      throw new Error('Failed to process COD payment');
    }
  }

  // Xử lý thanh toán MoMo
  private async processMoMo(order: any, amount: number, returnUrl: string) {
    try {
      // Sử dụng totalAmount từ order thay vì amount từ request
      const actualAmount = order.totalAmount;
      
      console.log('PaymentController processMoMo:');
      console.log('Request amount:', amount);
      console.log('Order totalAmount:', actualAmount);
      console.log('Using order totalAmount for payment');
      
      const paymentRequest = {
        orderId: order._id.toString(),
        amount: actualAmount, // Sử dụng order.totalAmount
        orderInfo: `Payment for order ${order._id}`,
        returnUrl: returnUrl,
        notifyUrl: `${process.env.BASE_URL}/api/payments/momo/callback`
      };

      const momoResponse = await this.momoService.createPayment(paymentRequest);

      if (momoResponse.resultCode === 0) {
        // KHÔNG tạo payment record ngay - chỉ tạo khi có callback xác nhận
        // Chỉ update order status và method
        order.paymentMethod = 'momo';
        order.paymentStatus = 'pending'; // Đặt trạng thái chờ thanh toán
        await order.save();

        console.log('MoMo payment URL created successfully, waiting for user to complete payment');

        return {
          success: true,
          message: 'MoMo payment URL created - waiting for payment completion',
          data: {
            paymentMethod: 'MoMo',
            status: 'pending',
            redirectUrl: momoResponse.payUrl,
            transactionId: momoResponse.requestId,
            orderId: order._id,
            amount: actualAmount,
            note: 'Payment record will be created after successful payment'
          }
        };
      } else {
        throw new Error(`MoMo payment creation failed: ${momoResponse.message}`);
      }
    } catch (error) {
      console.error('MoMo processing error:', error);
      throw new Error(`Failed to process MoMo payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Xử lý chuyển khoản ngân hàng
  private async processBankTransfer(order: any, amount: number) {
    try {
      // Sử dụng totalAmount từ order thay vì amount từ request
      const actualAmount = order.totalAmount;
      
      console.log('PaymentController processBankTransfer:');
      console.log('Request amount:', amount);
      console.log('Order totalAmount:', actualAmount);
      console.log('Using order totalAmount for payment');
      
      const bankTransferResult = await this.bankTransferService.createPayment({
        orderId: order._id.toString(),
        amount: actualAmount // Sử dụng order.totalAmount
      });

      // Tạo payment record với trạng thái pending - chờ admin xác nhận
      const payment = new Payment({
        orderId: order._id,
        userId: order.userId,
        paymentMethod: 'bank_transfer',
        amount: actualAmount, // Sử dụng order.totalAmount
        status: 'pending', // Chờ admin xác nhận chuyển khoản
        transactionId: bankTransferResult.transactionId,
        metadata: {
          bankInfo: bankTransferResult.bankInfo,
          transferContent: bankTransferResult.transferContent
        }
      });

      await payment.save();

      // Cập nhật order - chờ xác nhận
      order.paymentStatus = 'unpaid';
      order.paymentMethod = 'bank_transfer';
      order.status = 'pending'; // Chờ admin xác nhận
      await order.save();

      return {
        success: true,
        message: 'Bank transfer payment created - waiting for admin confirmation',
        paymentId: payment._id,
        paymentMethod: 'Bank Transfer',
        status: 'pending',
        bankInfo: bankTransferResult.bankInfo,
        transferContent: bankTransferResult.transferContent,
        instructions: bankTransferResult.instructions,
        transactionId: bankTransferResult.transactionId,
        note: 'Vui lòng chuyển khoản theo thông tin trên và chờ admin xác nhận'
      };
    } catch (error) {
      console.error('Bank transfer processing error:', error);
      throw new Error('Failed to process bank transfer payment');
    }
  }

  // Xử lý thanh toán PayPal
  private async processPayPal(order: any, amount: number, returnUrl: string) {
    try {
      // Sử dụng totalAmount từ order thay vì amount từ request
      const actualAmount = order.totalAmount;
      
      console.log('PaymentController processPayPal:');
      console.log('Request amount:', amount);
      console.log('Order totalAmount:', actualAmount);

      // Convert VND to USD for PayPal (PayPal doesn't support VND)
      const usdAmount = this.paypalService.convertVNDToUSD(actualAmount);
      
      const paypalOrderData = {
        intent: 'CAPTURE' as const,
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: usdAmount
          },
          description: `GreenMart Order #${order._id}`,
          invoice_id: order._id.toString()
        }],
        application_context: {
          return_url: returnUrl,
          cancel_url: returnUrl.replace('?method=paypal', '?method=paypal&cancelled=true'),
          brand_name: 'GreenMart',
          landing_page: 'NO_PREFERENCE' as const,
          shipping_preference: 'NO_SHIPPING' as const,
          user_action: 'PAY_NOW' as const
        }
      };

      const paypalOrderResult = await this.paypalService.createOrder(paypalOrderData);

      // Lưu payment record với userId từ order
      const payment = new Payment({
        orderId: order._id,
        userId: order.userId, // Thêm userId từ order
        paymentMethod: 'paypal',
        amount: actualAmount,
        currency: 'VND',
        paymentGateway: 'paypal',
        transactionId: paypalOrderResult.id,
        status: 'pending',
        gatewayResponse: paypalOrderResult,
        metadata: {
          usdAmount: parseFloat(usdAmount),
          exchangeRate: 24000
        }
      });

      await payment.save();

      // Tìm approve link từ PayPal response
      const approveLink = paypalOrderResult.links.find(link => link.rel === 'approve');

      if (!approveLink) {
        throw new Error('PayPal approval link not found in response');
      }

      return {
        success: true,
        message: 'PayPal payment created successfully',
        data: {
          paymentId: payment._id,
          paymentMethod: 'PayPal',
          status: 'pending',
          redirectUrl: approveLink.href,
          transactionId: paypalOrderResult.id,
          amount: actualAmount,
          currency: 'VND',
          usdAmount: parseFloat(usdAmount),
          exchangeRate: 24000,
          orderId: order._id
        }
      };
    } catch (error) {
      console.error('PayPal processing error:', error);
      throw new Error(`Failed to process PayPal payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Xử lý thanh toán thẻ tín dụng (qua MoMo gateway)
  private async processCreditCard(order: any, amount: number, returnUrl: string) {
    try {
      // Sử dụng totalAmount từ order thay vì amount từ request
      const actualAmount = order.totalAmount;
      
      console.log('PaymentController processCreditCard:');
      console.log('Request amount:', amount);
      console.log('Order totalAmount:', actualAmount);
      console.log('Using order totalAmount for payment');
      
      // Sử dụng MoMo gateway cho thẻ tín dụng
      const paymentRequest = {
        orderId: order._id.toString(),
        amount: actualAmount, // Sử dụng order.totalAmount
        orderInfo: `Credit Card payment for order ${order._id}`,
        returnUrl: returnUrl,
        notifyUrl: `${process.env.BASE_URL}/api/payments/momo/callback`
      };

      const momoResponse = await this.momoService.createPayment(paymentRequest);

      if (momoResponse.resultCode === 0) {
        // Tạo payment record với trạng thái pending
        const payment = new Payment({
          orderId: order._id,
          userId: order.userId,
          paymentMethod: 'credit_card',
          amount: actualAmount, // Sử dụng order.totalAmount
          status: 'pending',
          transactionId: momoResponse.requestId,
          metadata: {
            gatewayTransactionId: momoResponse.requestId,
            gateway: 'momo'
          }
        });

        await payment.save();

        // Cập nhật order
        order.paymentStatus = 'unpaid';
        order.paymentMethod = 'credit_card';
        await order.save();

        return {
          success: true,
          message: 'Credit Card payment created successfully',
          paymentId: payment._id,
          paymentMethod: 'Credit Card',
          status: 'pending',
          redirectUrl: momoResponse.payUrl,
          transactionId: momoResponse.requestId
        };
      } else {
        throw new Error(`Credit Card payment creation failed: ${momoResponse.message}`);
      }
    } catch (error) {
      console.error('Credit Card processing error:', error);
      throw new Error('Failed to process Credit Card payment');
    }
  }

  // Callback MoMo
  async momoCallback(req: Request, res: Response) {
    try {
      const callbackData = req.body;
      console.log('MoMo callback received:', callbackData);

      const { orderId, requestId, resultCode, message } = callbackData;

      // Tìm payment record (có thể là momo hoặc credit_card)
      const payment = await Payment.findOne({ 
        transactionId: requestId 
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Cập nhật trạng thái payment
      if (resultCode === 0) {
        payment.status = 'completed';
        await payment.save();

        // Cập nhật order - MoMo thanh toán thành công = tự động xác nhận đơn hàng
        const order = await Order.findById(payment.orderId);
        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'confirmed'; // Tự động xác nhận đơn hàng khi MoMo thanh toán thành công
          await order.save();
          
          console.log(`Order ${order._id} automatically confirmed after successful MoMo/CreditCard payment`);
        }

        return res.json({
          success: true,
          message: 'Payment completed and order confirmed automatically'
        });
      } else {
        payment.status = 'failed';
        payment.failureReason = message;
        await payment.save();

        // Cập nhật order
        const order = await Order.findById(payment.orderId);
        if (order) {
          order.paymentStatus = 'unpaid';
          await order.save();
        }

        return res.json({
          success: false,
          message: 'Payment failed',
          reason: message
        });
      }
    } catch (error) {
      console.error('MoMo callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Callback processing failed'
      });
    }
  }

  // Xác nhận chuyển khoản ngân hàng (Admin)
  async confirmBankTransfer(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { status, adminNote } = req.body; // status: 'confirmed' hoặc 'rejected'

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment.paymentMethod !== 'bank_transfer') {
        return res.status(400).json({
          success: false,
          message: 'This function is only for bank transfer payments'
        });
      }

      // Chỉ cập nhật payment, không cập nhật order (để OrderController xử lý)
      if (status === 'confirmed') {
        payment.status = 'completed';
        payment.adminNote = adminNote || 'Bank transfer confirmed by admin';
        
        // Cập nhật paymentStatus của order
        const order = await Order.findById(payment.orderId);
        if (order) {
          order.paymentStatus = 'paid';
          await order.save();
        }
      } else if (status === 'rejected') {
        payment.status = 'failed';
        payment.failureReason = adminNote || 'Bank transfer rejected by admin';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Use "confirmed" or "rejected"'
        });
      }

      await payment.save();

      return res.json({
        success: true,
        message: `Bank transfer ${status} successfully`,
        payment: {
          id: payment._id,
          status: payment.status,
          orderId: payment.orderId
        }
      });
    } catch (error) {
      console.error('Confirm bank transfer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Xác nhận đơn hàng COD (Admin)
  async confirmCOD(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { status, adminNote } = req.body; // status: 'confirmed' hoặc 'rejected'

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment.paymentMethod !== 'cod') {
        return res.status(400).json({
          success: false,
          message: 'This function is only for COD payments'
        });
      }

      // Chỉ cập nhật payment, không cập nhật order status (để OrderController xử lý)
      if (status === 'confirmed') {
        payment.status = 'pending'; // COD vẫn pending cho đến khi giao hàng thành công
        payment.adminNote = adminNote || 'COD order confirmed by admin';
      } else if (status === 'rejected') {
        payment.status = 'failed';
        payment.failureReason = adminNote || 'COD order rejected by admin';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Use "confirmed" or "rejected"'
        });
      }

      await payment.save();

      return res.json({
        success: true,
        message: `COD order ${status} successfully`,
        payment: {
          id: payment._id,
          status: payment.status,
          orderId: payment.orderId
        }
      });
    } catch (error) {
      console.error('Confirm COD error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Lấy thông tin payment
  async getPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;

      const payment = await Payment.findById(paymentId).populate('orderId');
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        payment: {
          id: payment._id,
          orderId: payment.orderId,
          paymentMethod: payment.paymentMethod,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt,
          bankInfo: payment.metadata?.bankInfo,
          transferContent: payment.metadata?.transferContent,
          adminNote: payment.metadata?.adminNote,
          confirmedAt: payment.metadata?.confirmedAt
        }
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Lấy danh sách phương thức thanh toán
  async getPaymentMethods(req: Request, res: Response) {
    try {
      const paymentMethods = [
        {
          id: 'cod',
          name: 'Cash on Delivery (COD)',
          description: 'Thanh toán khi nhận hàng',
          enabled: true,
          icon: 'cash'
        },
        {
          id: 'momo',
          name: 'MoMo E-Wallet',
          description: 'Thanh toán qua ví điện tử MoMo',
          enabled: true,
          icon: 'momo'
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Chuyển khoản ngân hàng thủ công',
          enabled: true,
          icon: 'bank'
        },
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Thanh toán an toàn qua PayPal',
          enabled: true,
          icon: 'paypal'
        }
      ];

      res.json({
        success: true,
        paymentMethods
      });
    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Lấy danh sách payments (Admin)
  async getPayments(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, paymentMethod } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build filter
      const filter: any = {};
      if (status) filter.status = status;
      if (paymentMethod) filter.paymentMethod = paymentMethod;

      const payments = await Payment.find(filter)
        .populate('orderId', 'orderNumber customerInfo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Payment.countDocuments(filter);

      res.json({
        success: true,
        payments,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: payments.length,
          totalRecords: total
        }
      });
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // PayPal capture payment (hoàn tất thanh toán)
  async capturePayPalPayment(req: Request, res: Response) {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'PayPal order ID is required'
        });
      }

      // Capture payment từ PayPal
      const captureResult = await this.paypalService.captureOrder(orderId);

      // Tìm payment record
      const payment = await Payment.findOne({ transactionId: orderId });
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }

      // Kiểm tra trạng thái capture
      const captureStatus = captureResult.purchase_units[0]?.payments?.captures[0]?.status;
      
      if (captureStatus === 'COMPLETED') {
        // Cập nhật payment status
        payment.status = 'completed';
        payment.gatewayResponse = captureResult;
        payment.updatedAt = new Date();
        await payment.save();

        // Cập nhật order status
        const order = await Order.findById(payment.orderId);
        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'confirmed';
          order.updatedAt = new Date();
          await order.save();

          console.log('PayPal payment - Order details:', {
            orderId: order._id,
            userId: order.userId,
            hasUserId: !!order.userId,
            isGuestOrder: order.isGuestOrder
          });

          // Tạo notification sau khi thanh toán PayPal thành công
          try {
            if (order.userId) {
              await NotificationHelper.notifyPaymentCompleted(order.userId.toString(), order, 'paypal');
              console.log('Payment completion notification created for PayPal');
            } else {
              console.log('No userId found in order, skipping notification (likely guest order)');
            }
          } catch (notificationError) {
            console.error('Error creating payment notification after PayPal payment:', notificationError);
            // Don't fail the payment processing if notification fails
          }
        }

        res.json({
          success: true,
          message: 'Payment completed successfully',
          transactionId: orderId,
          captureId: captureResult.purchase_units[0]?.payments?.captures[0]?.id,
          status: 'completed'
        });
      } else {
        // Payment failed
        payment.status = 'failed';
        payment.gatewayResponse = captureResult;
        payment.updatedAt = new Date();
        await payment.save();

        res.status(400).json({
          success: false,
          message: 'Payment capture failed',
          status: captureStatus
        });
      }
    } catch (error) {
      console.error('PayPal capture error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to capture PayPal payment',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  // MoMo callback - xử lý callback từ MoMo sau khi thanh toán
  async handleMoMoCallback(req: Request, res: Response) {
    try {
      const callbackData = req.body;
      
      console.log('MoMo callback received:', callbackData);

      // Verify signature
      const isValidSignature = this.momoService.verifyCallback(callbackData);
      
      if (!isValidSignature) {
        console.error('Invalid MoMo callback signature');
        return res.status(400).json({
          success: false,
          message: 'Invalid signature'
        });
      }

      const { orderId, resultCode, transId, amount, message } = callbackData;

      // Tìm order
      const order = await Order.findById(orderId);
      if (!order) {
        console.error('Order not found for MoMo callback:', orderId);
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (resultCode === 0) {
        // Thanh toán thành công - TẠO payment record
        const payment = new Payment({
          orderId: order._id,
          userId: order.userId,
          paymentMethod: 'momo',
          amount: amount,
          status: 'completed',
          transactionId: transId,
          metadata: {
            gatewayTransactionId: transId,
            resultCode: resultCode,
            message: message
          }
        });

        await payment.save();

        // Cập nhật order status
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();

        console.log('MoMo payment - Order details:', {
          orderId: order._id,
          userId: order.userId,
          hasUserId: !!order.userId,
          isGuestOrder: order.isGuestOrder
        });

        // Tạo notification sau khi thanh toán MoMo thành công
        try {
          if (order.userId) {
            await NotificationHelper.notifyPaymentCompleted(order.userId.toString(), order, 'momo');
            console.log('Payment completion notification created for MoMo');
          } else {
            console.log('No userId found in order, skipping notification (likely guest order)');
          }
        } catch (notificationError) {
          console.error('Error creating payment notification after MoMo payment:', notificationError);
          // Don't fail the payment processing if notification fails
        }

        console.log('MoMo payment completed successfully:', {
          orderId,
          transactionId: transId,
          amount
        });

        res.status(200).json({
          success: true,
          message: 'Payment completed successfully'
        });
      } else {
        // Thanh toán thất bại
        console.log('MoMo payment failed:', {
          orderId,
          resultCode,
          message
        });

        // Cập nhật order status
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        await order.save();

        res.status(200).json({
          success: false,
          message: 'Payment failed'
        });
      }
    } catch (error) {
      console.error('MoMo callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // PayPal webhook (optional - để nhận thông báo từ PayPal)
  async handlePayPalWebhook(req: Request, res: Response) {
    try {
      const event = req.body;
      
      console.log('PayPal webhook received:', event.event_type);

      // Xử lý các event từ PayPal
      switch (event.event_type) {
        case 'CHECKOUT.ORDER.APPROVED':
          // Order được approve bởi user
          console.log('PayPal order approved:', event.resource.id);
          break;
          
        case 'PAYMENT.CAPTURE.COMPLETED':
          // Payment được capture thành công
          console.log('PayPal payment captured:', event.resource.id);
          break;
          
        case 'PAYMENT.CAPTURE.DENIED':
          // Payment bị từ chối
          console.log('PayPal payment denied:', event.resource.id);
          break;
          
        default:
          console.log('Unhandled PayPal webhook event:', event.event_type);
      }

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('PayPal webhook error:', error);
      res.status(500).json({ status: 'error' });
    }
  }
}

export default new PaymentController();
