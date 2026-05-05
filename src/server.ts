import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { connectDB } from './config/database';
import mongoose from 'mongoose';

const PORT = Number(process.env.PORT) || 3001;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
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