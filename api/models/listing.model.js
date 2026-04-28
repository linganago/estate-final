import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
    description: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    regularPrice: { type: Number, required: true, min: 1 },
    discountPrice: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, required: true, min: 1 },
    bedrooms: { type: Number, required: true, min: 1 },
    furnished: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    type: { type: String, required: true, enum: ['sale', 'rent'] },
    offer: { type: Boolean, required: true, default: false },
    imageUrls: { type: [String], required: true, validate: [(arr) => arr.length > 0, 'At least one image required'] },
    userRef: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes for search performance
listingSchema.index({ type: 1, offer: 1 });
listingSchema.index({ userRef: 1 });
listingSchema.index({ regularPrice: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ name: 'text', description: 'text', address: 'text' });

const Listing = mongoose.model('Listing', listingSchema);

export { Listing };
