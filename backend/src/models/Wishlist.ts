import { Schema, model, Document, Types } from 'mongoose';

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  productId: {
    type: String,
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productImage: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100
  },
  inStock: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index để đảm bảo user không thể thêm cùng 1 sản phẩm 2 lần
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Virtual để populate user info nếu cần
wishlistSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Instance methods
wishlistSchema.methods.updateProduct = function(productData: Partial<IWishlist>) {
  Object.assign(this, productData);
  return this.save();
};

// Static methods
wishlistSchema.statics.findByUserId = function(userId: Types.ObjectId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

wishlistSchema.statics.findByUserAndProduct = function(userId: Types.ObjectId, productId: string) {
  return this.findOne({ userId, productId });
};

wishlistSchema.statics.removeByUserAndProduct = function(userId: Types.ObjectId, productId: string) {
  return this.deleteOne({ userId, productId });
};

wishlistSchema.statics.clearUserWishlist = function(userId: Types.ObjectId) {
  return this.deleteMany({ userId });
};

wishlistSchema.statics.getWishlistCount = function(userId: Types.ObjectId) {
  return this.countDocuments({ userId });
};

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
