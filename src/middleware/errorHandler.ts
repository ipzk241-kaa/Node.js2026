import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation error', details: err.issues });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(404).json({ error: 'Mongoose Validation error', details: err.errors });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key error' });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
};