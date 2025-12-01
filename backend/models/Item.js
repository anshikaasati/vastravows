import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    // Men / Women collection
    gender: { type: String, enum: ['men', 'women'], required: true },
    // High-level category (used for filtering/UX buckets)
    category: {
      type: String,
      enum: ['clothes', 'jewellery', 'accessories', 'watch', 'shoes'],
      required: true
    },
    // Flexible subcategory to support Western / Traditional and future expansions
    // Examples:
    //  - women-clothes-western, women-clothes-traditional
    //  - men-clothes-western, men-clothes-traditional
    //  - women-jewellery, men-accessories, etc.
    subcategory: { type: String, required: true },
    // Size string kept free-form so we can support S/M/L, 38/40, etc.
    size: { type: String, required: true },
    images: [{ type: String }],
    rentPricePerDay: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    depositAmount: { type: Number, default: 0, min: 0 },
    // Structured location fields plus full address text for display
    location: { type: locationSchema, required: true },
    addressLine: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model('Item', itemSchema);


