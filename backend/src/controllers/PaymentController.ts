import { Request, Response } from 'express';
import Order, { IOrder } from '../models/Order';
import Payment, { IPayment } from '../models/Payment';
import { MoMoService } from '../services/momoService';
import { BankTransferService } from '../services/bankTransferService';

export class PaymentController {
  private momoService: MoMoService;
  private bankTransferService: BankTransferService;

  constructor() {
    this.momoService = new MoMoService();
    this.bankTransferService = new BankTransferService();
  }

  // Tạo thanh toán
  async createPayment(req: Request, res: Response) {
    try {
      const { orderId, paymentMethod, amount, returnUrl } = req.body;

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
        default:
          return res.status(400).json({
            success: false,
            message: 'Unsupported payment method. Supported methods: cod, momo, bank_transfer'
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
      // Tạo payment record
      const payment = new Payment({
        orderId: order._id,
        userId: order.userId,
        paymentMethod: 'cod',
        amount: amount,
        status: 'completed',
        transactionId: `COD_${order._id}_${Date.now()}`
      });

      await payment.save();

      // Cập nhật trạng thái order
      order.paymentStatus = 'paid';
      order.paymentMethod = 'cod';
      await order.save();

      return {
        success: true,
        message: 'COD payment processed successfully',
        paymentId: payment._id,
        paymentMethod: 'COD',
        status: 'completed',
        transactionId: payment.transactionId
      };
    } catch (error) {
      console.error('COD processing error:', error);
      throw new Error('Failed to process COD payment');
    }
  }

  // Xử lý thanh toán MoMo
  private async processMoMo(order: any, amount: number, returnUrl: string) {
    try {
      const paymentRequest = {
        orderId: order._id.toString(),
        amount: amount,
        orderInfo: `Payment for order ${order._id}`,
        returnUrl: returnUrl,
        notifyUrl: `${process.env.BASE_URL}/api/payments/momo/callback`
      };

      const momoResponse = await this.momoService.createPayment(paymentRequest);

      if (momoResponse.resultCode === 0) {
        // Tạo payment record với trạng thái pending
        const payment = new Payment({
          orderId: order._id,
          userId: order.userId,
          paymentMethod: 'momo',
          amount: amount,
          status: 'pending',
          transactionId: momoResponse.requestId,
          metadata: {
            gatewayTransactionId: momoResponse.requestId
          }
        });

        await payment.save();

        // Cập nhật order
        order.paymentStatus = 'unpaid';
        order.paymentMethod = 'momo';
        await order.save();

        return {
          success: true,
          message: 'MoMo payment created successfully',
          paymentId: payment._id,
          paymentMethod: 'MoMo',
          status: 'pending',
          redirectUrl: momoResponse.payUrl,
          transactionId: momoResponse.requestId
        };
      } else {
        throw new Error(`MoMo payment creation failed: ${momoResponse.message}`);
      }
    } catch (error) {
      console.error('MoMo processing error:', error);
      throw new Error('Failed to process MoMo payment');
    }
  }

  // Xử lý chuyển khoản ngân hàng
  private async processBankTransfer(order: any, amount: number) {
    try {
      const bankTransferResult = await this.bankTransferService.createPayment({
        orderId: order._id.toString(),
        amount: amount
      });

      // Tạo payment record
      const payment = new Payment({
        orderId: order._id,
        userId: order.userId,
        paymentMethod: 'bank_transfer',
        amount: amount,
        status: 'pending',
        transactionId: bankTransferResult.transactionId,
        metadata: {
          bankInfo: bankTransferResult.bankInfo,
          transferContent: bankTransferResult.transferContent
        }
      });

      await payment.save();

      // Cập nhật order
      order.paymentStatus = 'unpaid';
      order.paymentMethod = 'bank_transfer';
      await order.save();

      return {
        success: true,
        message: 'Bank transfer payment created successfully',
        paymentId: payment._id,
        paymentMethod: 'Bank Transfer',
        status: 'pending',
        bankInfo: bankTransferResult.bankInfo,
        transferContent: bankTransferResult.transferContent,
        instructions: bankTransferResult.instructions,
        transactionId: bankTransferResult.transactionId
      };
    } catch (error) {
      console.error('Bank transfer processing error:', error);
      throw new Error('Failed to process bank transfer payment');
    }
  }

  // Callback MoMo
  async momoCallback(req: Request, res: Response) {
    try {
      const callbackData = req.body;
      console.log('MoMo callback received:', callbackData);

      const { orderId, requestId, resultCode, message } = callbackData;

      // Tìm payment record
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

        // Cập nhật order
        const order = await Order.findById(payment.orderId);
        if (order) {
          order.paymentStatus = 'paid';
          await order.save();
        }

        return res.json({
          success: true,
          message: 'Payment completed successfully'
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
      const { status, adminNote } = req.body;

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
          message: 'This is not a bank transfer payment'
        });
      }

      // Cập nhật payment
      payment.status = status; // 'completed' hoặc 'failed'
      payment.metadata = {
        ...payment.metadata,
        adminNote: adminNote,
        confirmedAt: new Date(),
        confirmedBy: req.user?.userId || req.user?._id
      };
      await payment.save();

      // Cập nhật order
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.paymentStatus = status === 'completed' ? 'paid' : 'unpaid';
        await order.save();
      }

      res.json({
        success: true,
        message: `Bank transfer ${status} successfully`,
        payment: {
          id: payment._id,
          status: payment.status,
          adminNote: payment.metadata?.adminNote,
          confirmedAt: payment.metadata?.confirmedAt
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
}

export default new PaymentController();
