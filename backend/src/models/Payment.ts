import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay' | 'credit_card' | 'shopeepay' | 'paypal';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transactionId?: string;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  failureReason?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch: string;
  };
  transferContent?: string;
  adminNote?: string;
  confirmedAt?: Date;
  confirmedBy?: string;
  metadata?: {
    bankAccount?: string;
    bankName?: string;
    walletId?: string;
    cardLast4?: string;
    cardBrand?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const PaymentSchema: Schema = new Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'VND',
    enum: ['VND', 'USD']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cod', 'bank_transfer', 'momo', 'zalopay', 'vnpay', 'credit_card', 'shopeepay', 'paypal']
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']
  },
  transactionId: {
    type: String,
    sparse: true,
    index: true
  },
  gatewayResponse: {
    type: Schema.Types.Mixed,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
PaymentSchema.index({ orderId: 1, status: 1 });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ paymentMethod: 1, status: 1 });
PaymentSchema.index({ transactionId: 1 }, { sparse: true });

// Virtual for payment gateway name
PaymentSchema.virtual('gatewayName').get(function(this: IPayment) {
  const methodMap: { [key: string]: string } = {
    'cod': 'Cash on Delivery',
    'bank_transfer': 'Bank Transfer',
    'momo': 'MoMo Wallet',
    'zalopay': 'ZaloPay Wallet',
    'vnpay': 'VNPay Gateway',
    'credit_card': 'Credit/Debit Card',
    'shopeepay': 'ShopeePay Wallet'
  };
  return methodMap[this.paymentMethod] || this.paymentMethod;
});

// Instance method to check if payment is successful
PaymentSchema.methods.isSuccessful = function() {
  return this.status === 'completed';
};

// Instance method to check if payment can be refunded
PaymentSchema.methods.canRefund = function() {
  return this.status === 'completed' && this.paymentMethod !== 'cod';
};

// Static method to find payments by order
PaymentSchema.statics.findByOrder = function(orderId: string) {
  return this.find({ orderId }).sort({ createdAt: -1 });
};

// Static method to find user payments
PaymentSchema.statics.findByUser = function(userId: string, limit: number = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('orderId');
};

export default mongoose.model<IPayment>('Payment', PaymentSchema);
