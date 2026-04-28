import { createServer } from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import { initSocket } from './socket.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Wrap Express in a native HTTP server so Socket.IO shares the same port
const httpServer = createServer(app);
initSocket(httpServer);

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });

