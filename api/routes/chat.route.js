import express from 'express';
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} from '../controllers/chat.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// All chat routes require authentication
router.use(verifyToken);

router.post('/conversations', getOrCreateConversation);
router.get('/conversations', getMyConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

export default router;
