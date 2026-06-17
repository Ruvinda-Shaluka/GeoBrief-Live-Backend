import { Request, Response, NextFunction } from 'express';
import connectDB from '../config/db.js';

export const dbMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Skip DB connection for status route to keep status checks fast
  if (req.path === '/status' || req.path === '/api/status') {
    next();
    return;
  }

  try {
    await connectDB();
    next();
  } catch (err: any) {
    console.error("Database connection middleware failure:", err);
    res.status(500).json({
      message: "Database connection failed. Please ensure MONGO_URI is set correctly in Vercel, and IP Whitelisting (0.0.0.0/0) is configured on MongoDB Atlas.",
      error: err.message || err
    });
  }
};
