import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  position: 'hero' | 'sidebar' | 'footer' | 'category' | 'promo' | 'sale' | 'featured';
  categoryId?: mongoose.Types.ObjectId;
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
  subtitle: {
    type: String,
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
  buttonText: {
    type: String,
    trim: true,
    default: 'Xem thêm'
  },
  buttonLink: {
    type: String,
    trim: true
  },
  backgroundColor: {
    type: String,
    trim: true,
    default: 'from-green-400 to-emerald-500'
  },
  textColor: {
    type: String,
    trim: true,
    default: 'text-white'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  position: {
    type: String,
    enum: ['hero', 'sidebar', 'footer', 'category', 'promo', 'sale', 'featured'],
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
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
