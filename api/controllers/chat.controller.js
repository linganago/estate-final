import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import { errorHandler } from '../utils/error.js';

/**
 * GET or CREATE a conversation between a buyer and a listing owner.
 * Called when buyer clicks "Chat with Owner" on a listing page.
 */
export const getOrCreateConversation = async (req, res, next) => {
  const { listingId, listingName, ownerId } = req.body;
  const buyerId = req.user.id;

  if (!listingId || !ownerId || !listingName) {
    return next(errorHandler(400, 'listingId, ownerId, and listingName are required'));
  }

  if (buyerId === ownerId) {
    return next(errorHandler(400, "You can't chat with yourself"));
  }

  try {
    let conv = await Conversation.findOne({ listingId, buyerId });

    if (!conv) {
      conv = await Conversation.create({ listingId, listingName, buyerId, ownerId });
    }

    res.status(200).json({ success: true, conversation: conv });
  } catch (err) {
    next(err);
  }
};

/**
 * GET all conversations for the current user (as buyer or owner).
 */
export const getMyConversations = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const convs = await Conversation.find({
      $or: [{ buyerId: userId }, { ownerId: userId }],
    }).sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, conversations: convs });
  } catch (err) {
    next(err);
  }
};

/**
 * GET messages for a conversation (paginated, newest last).
 */
export const getMessages = async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = 50;

  try {
    const conv = await Conversation.findById(conversationId);
    if (!conv) return next(errorHandler(404, 'Conversation not found'));
    if (conv.buyerId !== userId && conv.ownerId !== userId) {
      return next(errorHandler(403, 'Access denied'));
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Mark messages as read for this user
    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    // Reset unread count
    if (conv.buyerId === userId) {
      await Conversation.findByIdAndUpdate(conversationId, { buyerUnread: 0 });
    } else {
      await Conversation.findByIdAndUpdate(conversationId, { ownerUnread: 0 });
    }

    res.status(200).json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

/**
 * POST a new message (REST fallback — Socket.IO is preferred).
 */
export const sendMessage = async (req, res, next) => {
  const { conversationId } = req.params;
  const senderId = req.user.id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return next(errorHandler(400, 'Message text is required'));
  }

  try {
    const conv = await Conversation.findById(conversationId);
    if (!conv) return next(errorHandler(404, 'Conversation not found'));
    if (conv.buyerId !== senderId && conv.ownerId !== senderId) {
      return next(errorHandler(403, 'Access denied'));
    }

    const message = await Message.create({ conversationId, senderId, text: text.trim() });

    // Update conversation metadata
    const isBuyer = senderId === conv.buyerId;
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text.trim().slice(0, 100),
      lastMessageAt: new Date(),
      // Increment the OTHER user's unread count
      ...(isBuyer ? { ownerUnread: conv.ownerUnread + 1 } : { buyerUnread: conv.buyerUnread + 1 }),
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};
