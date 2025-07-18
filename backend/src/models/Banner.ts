import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  position: 'hero' | 'sidebar' | 'footer' | 'category';
  priority: number;
  startDate: Date;
  endDate?: Date;
  clickCount: number;
}

const BannerSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  linkUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  position: {
    type: String,
    enum: ['hero', 'sidebar', 'footer', 'category'],
    required: true
  },
  priority: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  clickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
BannerSchema.index({ position: 1, isActive: 1, priority: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model<IBanner>('Banner', BannerSchema);
