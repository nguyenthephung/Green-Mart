import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId; // null for global notifications
  type: 'order' | 'promotion' | 'system' | 'review' | 'shipping' | 'admin' | 'voucher' | 'payment' | 'account';
  title: string;
  description: string;
  orderId?: mongoose.Types.ObjectId;
  trackingCode?: string;
  productName?: string;
  image?: string;
  isRead: boolean;
  reward?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string; // URL to redirect when clicked
  actionText?: string; // Text for action button
  isGlobal: boolean; // For admin broadcast notifications
  targetRole?: 'user' | 'admin' | 'all'; // Target audience
  expiresAt?: Date; // When notification expires
  createdBy?: mongoose.Types.ObjectId; // Admin who created it
  metadata?: any; // Additional data for complex notifications
}

const NotificationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for global notifications
  },
  type: {
    type: String,
    enum: ['order', 'promotion', 'system', 'review', 'shipping', 'admin', 'voucher', 'payment', 'account'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  trackingCode: {
    type: String,
    trim: true
  },
  productName: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  reward: {
    type: Number,
    min: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: 50
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  targetRole: {
    type: String,
    enum: ['user', 'admin', 'all'],
    default: 'user'
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ isGlobal: 1, targetRole: 1 });
NotificationSchema.index({ expiresAt: 1 });

// Pre-save middleware to handle expiration
NotificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt && this.type === 'promotion') {
    // Promotions expire in 30 days by default
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
