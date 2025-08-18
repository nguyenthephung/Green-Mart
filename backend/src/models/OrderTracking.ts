import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderTracking extends Document {
  orderId: mongoose.Types.ObjectId;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: string;
  updatedAt: Date;
}

const OrderTrackingSchema: Schema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String },
  },
  status: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOrderTracking>('OrderTracking', OrderTrackingSchema);
