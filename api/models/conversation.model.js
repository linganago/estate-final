import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    listingId: { type: String, required: true },
    listingName: { type: String, required: true },
    buyerId: { type: String, required: true },
    ownerId: { type: String, required: true },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    buyerUnread: { type: Number, default: 0 },
    ownerUnread: { type: Number, default: 0 },
  },
  { timestamps: true }
);

conversationSchema.index({ buyerId: 1 });
conversationSchema.index({ ownerId: 1 });
conversationSchema.index({ listingId: 1, buyerId: 1 }, { unique: true });

export default mongoose.model('Conversation', conversationSchema);
