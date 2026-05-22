import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  // Validate JWT_SECRET before use to prevent runtime failure
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in the environment.');
    res.status(500).json({ message: 'Internal server configuration error' });
    return; 
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      req.user = user;
      next(); 
    } catch (error) {
      // Avoid logging raw token verification errors in production
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
      res.status(401).json({ message: 'Not authorized, token failed' });
      return; // Prevent control flow issues
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
    return; // Prevent control flow issues
  }
};