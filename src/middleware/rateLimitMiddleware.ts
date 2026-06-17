import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestCounts = new Map<string, RateLimitRecord>();

/**
 * Lightweight, in-memory IP-based rate limiter middleware.
 * @param limit Maximum number of requests allowed in the window.
 * @param windowMs Window size in milliseconds.
 */
export const rateLimiter = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client IP safely
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = ipRequestCounts.get(ip);

    // If no record exists, or the reset time has passed, initialize/reset request tracking
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      ipRequestCounts.set(ip, record);
      next();
      return;
    }

    // Check if limit is exceeded
    if (record.count >= limit) {
      res.status(429).json({
        message: 'Too many requests from this IP address. Please try again later.'
      });
      return;
    }

    // Increment request count
    record.count++;
    next();
  };
};
