import mongoose, { Document, Schema } from 'mongoose';

export interface IFlashSale extends Document {
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  products: {
    productId: string;
    originalPrice: number;
    flashSalePrice: number;
    discountPercentage: number;
    quantity: number; // Số lượng sản phẩm trong flash sale
    sold: number; // Số lượng đã bán
  }[];
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  bannerImage?: string;
  priority: number; // Để sắp xếp thứ tự hiển thị
}

const FlashSaleSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: IFlashSale, value: Date) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  products: [{
    productId: {
      type: String,
      required: true
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    flashSalePrice: {
      type: Number,
      required: true,
      min: 0
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    sold: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  bannerImage: {
    type: String
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index để tìm kiếm hiệu quả
FlashSaleSchema.index({ startTime: 1, endTime: 1 });
FlashSaleSchema.index({ status: 1, isActive: 1 });
FlashSaleSchema.index({ 'products.productId': 1 });

// Middleware để tự động cập nhật status
FlashSaleSchema.pre('save', function(this: IFlashSale) {
  const now = new Date();
  
  if (this.startTime > now) {
    this.status = 'scheduled';
  } else if (this.endTime < now) {
    this.status = 'ended';
  } else if (this.startTime <= now && this.endTime >= now && this.isActive) {
    this.status = 'active';
  }
});

// Static method để tìm flash sale đang hoạt động
FlashSaleSchema.statics.findActiveFlashSales = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gte: now },
    status: 'active'
  }).sort({ priority: -1, startTime: 1 });
};

// Static method để tìm flash sale sắp tới
FlashSaleSchema.statics.findUpcomingFlashSales = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startTime: { $gt: now },
    status: 'scheduled'
  }).sort({ startTime: 1 });
};

// Instance method để kiểm tra xem sản phẩm có trong flash sale không
FlashSaleSchema.methods.hasProduct = function(productId: string) {
  return this.products.some((p: any) => p.productId === productId);
};

// Instance method để lấy thông tin sản phẩm trong flash sale
FlashSaleSchema.methods.getProductInfo = function(productId: string) {
  return this.products.find((p: any) => p.productId === productId);
};

export default mongoose.model<IFlashSale>('FlashSale', FlashSaleSchema);
