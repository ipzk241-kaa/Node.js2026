import express from 'express';
import mongoose from 'mongoose';
import itemRoutes from './routes/item.routes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.get('/health', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: 'OK', database: 'Connected' });
  } else {
    res.status(503).json({ status: 'Service Unavailable', database: 'Disconnected' });
  }
});

app.use(express.json());

app.use('/api/items', itemRoutes);

app.use(errorHandler);