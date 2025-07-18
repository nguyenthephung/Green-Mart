import mongoose, { Document, Schema } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  label: string;
  description: string;
  minOrder: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  expired: Date;
  usedPercent: number;
  maxUsage?: number;
  currentUsage: number;
  onlyOn?: string;
  isActive: boolean;
  note?: string;
}

const VoucherSchema: Schema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  minOrder: {
    type: Number,
    required: true,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percent', 'amount'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  expired: {
    type: Date,
    required: true
  },
  usedPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  maxUsage: {
    type: Number,
    min: 1
  },
  currentUsage: {
    type: Number,
    default: 0,
    min: 0
  },
  onlyOn: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
VoucherSchema.index({ code: 1 });
VoucherSchema.index({ isActive: 1, expired: 1 });

export default mongoose.model<IVoucher>('Voucher', VoucherSchema);
