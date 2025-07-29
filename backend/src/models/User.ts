import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  avatar?: string;
  role: 'admin' | 'user' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  isVerified: boolean;
  joinDate: Date;
  lastLogin: Date;
  totalOrders: number;
  totalSpent: number;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  vouchers?: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'staff'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  vouchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    default: []
  }]
}, {
  timestamps: true
});

// Indexes (chỉ tạo index cho các field không có unique: true)
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

export default mongoose.model<IUser>('User', UserSchema);
