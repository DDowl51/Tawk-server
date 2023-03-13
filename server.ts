import http from 'http';
import https from 'https';
import app from './app';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import socketHandler from './routes/socket.route';
import { ServerEvents } from './models/socket.event';
import { protect } from './controllers/socket.controller';

const server = http.createServer(app);
const safeServer = https.createServer(
  {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
  },
  app
);

// ------------------- Socket.IO -------------------
const io = new Server(safeServer, {
  cors: {
    origin: 'https://192.168.0.102:3000',
    methods: ['GET', 'POST'],
  },
});

io.use(protect);
io.on(ServerEvents.Connection, socketHandler);
// ------------------- Socket.IO -------------------

const port = process.env.PORT || 5001;
const safePort = process.env.SAFE_PORT || 5002;

(async () => {
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'Tawk-refactored',
    });
    console.log('Database connected');
  }
})();

server.listen(port, () => {
  console.log(`http running on port ${port}`);
});

safeServer.listen(safePort, () => {
  console.log(`https running on port ${safePort}`);
});
