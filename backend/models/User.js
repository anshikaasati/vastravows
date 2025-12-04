import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    avatarUrl: { type: String },
    // Razorpay Payouts/Route
    upiId: { type: String },
    razorpayContactId: { type: String }, // Legacy (Standard Payouts)
    razorpayAccountId: { type: String }, // New (Route Linked Account)
    razorpayFundAccountId: { type: String },
    // Razorpay Subscription (for lender monthly fee)
    razorpaySubscriptionId: { type: String },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'pending', 'cancelled', 'halted'],
      default: 'pending'
    },
    // Role Management
    roles: {
      type: [String],
      enum: ['buyer', 'lender'],
      default: ['buyer']
    },
    isLenderEnabled: { type: Boolean, default: false },
    // Soft Delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model('User', userSchema);


