import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId;
  type: 'order' | 'promotion' | 'system' | 'review' | 'shipping';
  title: string;
  description: string;
  orderId?: mongoose.Types.ObjectId;
  trackingCode?: string;
  productName?: string;
  image?: string;
  isRead: boolean;
  reward?: number;
}

const NotificationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['order', 'promotion', 'system', 'review', 'shipping'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
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
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  reward: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
