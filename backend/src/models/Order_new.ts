import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  weight?: number;
  unit?: string;
  total?: number;
  product?: mongoose.Types.ObjectId;
  name?: string;
}

export interface IGuestInfo {
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId; // Optional for guest orders
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  // Guest info for guest orders
  guestInfo?: IGuestInfo;
  isGuestOrder?: boolean;
  deliveryType?: 'pickup' | 'delivery';
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  voucherDiscount: number;
  voucherCode?: string;
  totalAmount: number;
  shippingFee?: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: 'cash' | 'cod' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay' | 'credit_card' | 'shopeepay';
  paymentStatus: 'unpaid' | 'paid' | 'completed' | 'failed' | 'pending' | 'refunded' | 'partially_refunded';
  paymentInfo?: any;
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  trackingCode?: string;
  paymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema: Schema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: 0
  },
  unit: {
    type: String,
    trim: true
  },
  total: {
    type: Number,
    min: 0
  }
});

const OrderSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional for guest orders
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerName: {
    type: String,
    required: false, // Will be filled from guestInfo for guest orders
    trim: true
  },
  customerEmail: {
    type: String,
    required: false,
    trim: true
  },
  customerPhone: {
    type: String,
    required: false,
    trim: true
  },
  customerAddress: {
    type: String,
    required: false,
    trim: true
  },
  // Guest order fields
  guestInfo: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    email: { type: String, trim: true }
  },
  isGuestOrder: {
    type: Boolean,
    default: false
  },
  deliveryType: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'delivery'
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
  shippingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'cod', 'bank_transfer', 'momo', 'zalopay', 'vnpay', 'credit_card', 'shopeepay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'completed', 'failed', 'pending', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentInfo: {
    type: Schema.Types.Mixed,
    default: null
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  trackingCode: {
    type: String,
    default: null
  },
  paymentId: {
    type: String,
    default: null
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Create indexes for better performance
OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ isGuestOrder: 1 });

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
