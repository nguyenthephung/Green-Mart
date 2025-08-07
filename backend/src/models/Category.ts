import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  subs: string[]; // Thêm subs vào interface
  subCategory?: string;
  icon: string;
  description?: string;
  productCount: number;
  status: 'active' | 'inactive';
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  subs: {
    type: [String],
    default: [] // mảng tên danh mục con
  },
  icon: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
CategorySchema.index({ name: 1 });
CategorySchema.index({ status: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);
