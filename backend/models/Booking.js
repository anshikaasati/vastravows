import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    // New fields
    renterName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    size: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    pickupAddress: { type: String }, // Optional, mostly for rentals return or owner pickup
    location: {
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String } // Full formatted address text
    },
    // Payment details
    depositAmount: { type: Number, default: 0 },
    rentAmount: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    deliveryCharges: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentMethod: { type: String }, // 'online' or 'cod' (which is now partial)
    depositPaymentMethod: { type: String },
    rentPaymentMethod: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'partially_paid'],
      default: 'pending'
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

bookingSchema.index({ itemId: 1, startDate: 1, endDate: 1 });

export default mongoose.model('Booking', bookingSchema);


