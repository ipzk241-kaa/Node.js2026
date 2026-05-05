import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { connectDB } from './config/database';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  process.on('SIGTERM', async () => {
    console.log('Отримано сигнал SIGTERM. Закриття HTTP сервера...');
    server.close(async () => {
      console.log('HTTP сервер закрито.');
      await mongoose.connection.close();
      console.log('MongoDB з\'єднання закрито.');
      process.exit(0);
    });
  });
};

startServer();