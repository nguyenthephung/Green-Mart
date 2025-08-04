import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationSettings extends Document {
  userId: mongoose.Types.ObjectId;
  settings: {
    order: boolean;
    promotion: boolean;
    system: boolean;
    review: boolean;
    shipping: boolean;
    admin: boolean;
    voucher: boolean;
    payment: boolean;
    account: boolean;
  };
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const NotificationSettingsSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  settings: {
    order: {
      type: Boolean,
      default: true
    },
    promotion: {
      type: Boolean,
      default: true
    },
    system: {
      type: Boolean,
      default: true
    },
    review: {
      type: Boolean,
      default: true
    },
    shipping: {
      type: Boolean,
      default: true
    },
    admin: {
      type: Boolean,
      default: true
    },
    voucher: {
      type: Boolean,
      default: true
    },
    payment: {
      type: Boolean,
      default: true
    },
    account: {
      type: Boolean,
      default: true
    }
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: false
  },
  smsNotifications: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
NotificationSettingsSchema.index({ userId: 1 });

export default mongoose.model<INotificationSettings>('NotificationSettings', NotificationSettingsSchema);
