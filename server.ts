import http from 'http';
import path from 'path';
import app from './app';
import mongoose from 'mongoose';

const server = http.createServer(app);

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
