import http from 'http';
import app from './app';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import socketHandler from './routes/socket.route';
import { ServerEvents } from './models/socket.event';
import { protect } from './controllers/socket.controller';

const server = http.createServer(app);

// ------------------- Socket.IO -------------------
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.use(protect);
io.on(ServerEvents.Connection, socketHandler);
// ------------------- Socket.IO -------------------

const port = process.env.PORT || 5001;

(async () => {
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'Tawk-refactored',
    });
    console.log('Database connected');
  }
})();

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
