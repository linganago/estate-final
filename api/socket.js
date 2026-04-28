import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Conversation from './models/conversation.model.js';
import Message from './models/message.model.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5173',
      ],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // ── Auth middleware ──────────────────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || '';
      const cookieToken = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('access_token='))
        ?.split('=')[1];

      const token = cookieToken || socket.handshake.auth?.token;

      if (!token) {
        console.log('[Socket] No token found');
        return next(new Error('Authentication error: no token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = (decoded.id || decoded._id)?.toString();

      if (!socket.userId) {
        return next(new Error('Authentication error: invalid payload'));
      }

      console.log(`[Socket] Auth OK - user ${socket.userId}`);
      next();
    } catch (err) {
      console.log('[Socket] Auth failed:', err.message);
      next(new Error('Authentication error: invalid token'));
    }
  });

  // ── Connection ───────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User ${userId} connected (${socket.id})`);

    socket.join(`user:${userId}`);

    // ── Join a conversation room ─────────────────────────────────────────────
    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        const conv = await Conversation.findById(conversationId);
        if (!conv) return socket.emit('error', { message: 'Conversation not found' });
        if (conv.buyerId !== userId && conv.ownerId !== userId) {
          return socket.emit('error', { message: 'Access denied' });
        }
        socket.join(`conv:${conversationId}`);
        socket.emit('joined', { conversationId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Leave a conversation room ────────────────────────────────────────────
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conv:${conversationId}`);
    });

    // ── Send a message ───────────────────────────────────────────────────────
    socket.on('send_message', async ({ conversationId, text }) => {
      if (!text || !text.trim()) return;

      try {
        const conv = await Conversation.findById(conversationId);
        if (!conv) return socket.emit('error', { message: 'Conversation not found' });
        if (conv.buyerId !== userId && conv.ownerId !== userId) {
          return socket.emit('error', { message: 'Access denied' });
        }

        const message = await Message.create({
          conversationId,
          senderId: userId,
          text: text.trim(),
        });

        const isBuyer = userId === conv.buyerId;
        const recipientId = isBuyer ? conv.ownerId : conv.buyerId;

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text.trim().slice(0, 100),
          lastMessageAt: new Date(),
          ...(isBuyer
            ? { ownerUnread: conv.ownerUnread + 1 }
            : { buyerUnread: conv.buyerUnread + 1 }),
        });

        // Broadcast to everyone in the conversation room
        io.to(`conv:${conversationId}`).emit('new_message', message);

        // Notify recipient's personal room for inbox badge
        io.to(`user:${recipientId}`).emit('conversation_updated', {
          conversationId,
          lastMessage: text.trim().slice(0, 100),
          lastMessageAt: new Date(),
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Typing indicators ────────────────────────────────────────────────────
    socket.on('typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', { userId });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_stopped_typing', { userId });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} disconnected`);
    });
  });

  return io;
}
