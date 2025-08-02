import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  voucherDiscount: number;
  voucherCode?: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay' | 'credit_card' | 'shopeepay';
  paymentStatus: 'unpaid' | 'paid' | 'completed' | 'failed' | 'pending' | 'refunded' | 'partially_refunded';
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  trackingCode?: string;
  paymentId?: string;
}

const OrderItemSchema: Schema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String
  }
});

const OrderSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  customerAddress: {
    type: String,
    required: true,
    trim: true
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  serviceFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  voucherDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  voucherCode: {
    type: String,
    default: null
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank_transfer', 'momo', 'zalopay', 'vnpay', 'credit_card', 'shopeepay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded', 'partially_refunded'],
    default: 'unpaid'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  trackingCode: {
    type: String,
    trim: true
  },
  paymentId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ trackingCode: 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ paymentStatus: 1 });

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});

// Instance methods
OrderSchema.methods.canCancel = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

OrderSchema.methods.canReturn = function() {
  return this.status === 'delivered' && 
         this.deliveryDate && 
         (Date.now() - this.deliveryDate.getTime()) <= 7 * 24 * 60 * 60 * 1000; // 7 days
};

export default mongoose.model<IOrder>('Order', OrderSchema);
