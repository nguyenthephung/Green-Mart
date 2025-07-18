import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationSettings extends Document {
  userId: mongoose.Types.ObjectId;
  settings: {
    order: boolean;
    promotion: boolean;
    system: boolean;
    review: boolean;
  };
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
    }
  }
}, {
  timestamps: true
});

// Indexes
NotificationSettingsSchema.index({ userId: 1 });

export default mongoose.model<INotificationSettings>('NotificationSettings', NotificationSettingsSchema);
