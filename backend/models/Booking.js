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
      pincode: { type: String, required: true }
    },
    // Payment details
    depositAmount: { type: Number, default: 0 },
    rentAmount: { type: Number, default: 0 },
    paymentMethod: { type: String }, // For Sale or general
    depositPaymentMethod: { type: String }, // For Rental Deposit (Online only)
    rentPaymentMethod: { type: String }, // For Rental Remaining (COD/Online)
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

bookingSchema.index({ itemId: 1, startDate: 1, endDate: 1 });

export default mongoose.model('Booking', bookingSchema);


