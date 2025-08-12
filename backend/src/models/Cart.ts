import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  image: string;
  type: 'count' | 'weight';
  quantity?: number; // chỉ dùng cho sản phẩm đếm số lượng
  weight?: number;   // chỉ dùng cho sản phẩm cân ký
  unit: string;
  flashSale?: {
    isFlashSale: boolean;
    originalPrice?: number;
    discountPercent?: number;
    discountPercentage?: number;
    flashSaleId?: mongoose.Types.ObjectId;
  };
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  totalAmount: number;
}

const CartItemSchema: Schema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
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
  image: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['count', 'weight'],
    required: true
  },
  quantity: {
    type: Number,
    required: false,
    min: 1
  },
  weight: {
    type: Number,
    required: false,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  flashSale: {
    isFlashSale: {
      type: Boolean,
      default: false
    },
    originalPrice: {
      type: Number,
      required: false
    },
    discountPercent: {
      type: Number,
      required: false
    },
    discountPercentage: {
      type: Number,
      required: false
    },
    flashSaleId: {
      type: Schema.Types.ObjectId,
      ref: 'FlashSale',
      required: false
    }
  }
});

const CartSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [CartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before save
CartSchema.pre('save', function(this: ICart, next) {
  this.totalItems = this.items.reduce((total: number, item: ICartItem) => {
    if (item.type === 'weight') {
      return total + (item.weight || 0);
    } else {
      return total + (item.quantity || 0);
    }
  }, 0);
  this.totalAmount = this.items.reduce((total: number, item: ICartItem) => {
    if (item.type === 'weight') {
      return total + (item.price * (item.weight || 0));
    } else {
      return total + (item.price * (item.quantity || 0));
    }
  }, 0);
  next();
});

// Indexes
CartSchema.index({ userId: 1 });

export default mongoose.model<ICart>('Cart', CartSchema);
