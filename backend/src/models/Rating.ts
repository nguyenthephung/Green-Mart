import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  rating: number;
  review?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  },
  images: [{
    type: String
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index để đảm bảo user chỉ rate 1 lần cho 1 product
RatingSchema.index({ userId: 1, productId: 1 }, { unique: true });
RatingSchema.index({ productId: 1 });
RatingSchema.index({ rating: 1 });

export default mongoose.model<IRating>('Rating', RatingSchema);
