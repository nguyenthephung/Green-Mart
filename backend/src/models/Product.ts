import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  type: 'count' | 'weight';
  name: string;
  price: number;
  salePrice?: number;
  discountAmount?: number;
  isSale: boolean;
  category: string;
  subCategory?: string;
  image: string;
  images: string[];
  stock: number;
  status: 'active' | 'inactive';
  description?: string;
  brand?: string;
  unit?: string;
  isFeatured: boolean;
  descriptionImages: string[];
  // Rating fields
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalSold: number;
}

const ProductSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['count', 'weight'],
    required: true,
    default: 'count',
    description: 'Loại sản phẩm: count (đếm số lượng), weight (cân ký)'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0
  },
  discountAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  isSale: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  description: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    trim: true,
    default: 'kg'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  descriptionImages: [{
    type: String
  }],
  // Rating fields
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  ratingDistribution: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 }
  },
  totalSold: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
