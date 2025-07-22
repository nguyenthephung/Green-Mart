import mongoose, { Schema, Document } from 'mongoose';

export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  district: string;
  ward: string;
  street: string;
  latitude?: number;
  longitude?: number;
  isSelected: boolean;
  label?: string;
  address?: string;
  wardName?: string;
  districtName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Document interface
export interface AddressDocument extends Document {
  userId: number;
  fullName: string;
  phone: string;
  district: string;
  ward: string;
  street: string;
  latitude?: number;
  longitude?: number;
  isDefaultSelected: boolean; // Changed name to avoid conflict
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const AddressSchema = new Schema<AddressDocument>({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  ward: {
    type: String,
    required: true,
    trim: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    default: undefined
  },
  longitude: {
    type: Number,
    default: undefined
  },
  isDefaultSelected: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  collection: 'addresses' // Tên collection
});

// Tạo model
export const AddressModel = mongoose.model<AddressDocument>('Address', AddressSchema);

export interface CreateAddressRequest {
  fullName: string;
  phone: string;
  district: string;
  ward: string;
  street: string;
  latitude?: number;
  longitude?: number;
  isSelected?: boolean;
}

export interface UpdateAddressRequest {
  fullName?: string;
  phone?: string;
  district?: string;
  ward?: string;
  street?: string;
  latitude?: number;
  longitude?: number;
  isSelected?: boolean;
}

export interface AddressResponse {
  id: string; // MongoDB _id là string
  userId: number;
  fullName: string;
  phone: string;
  district: string;
  ward: string;
  street: string;
  latitude?: number;
  longitude?: number;
  isSelected: boolean;
  label: string;
  address: string;
  wardName: string;
  districtName: string;
  createdAt: string;
  updatedAt: string;
}
