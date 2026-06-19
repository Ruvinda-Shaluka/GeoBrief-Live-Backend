import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; 
import authRoutes from './routes/authRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { rateLimiter } from './middleware/rateLimitMiddleware.js';
import { dbMiddleware } from './middleware/dbMiddleware.js';

const app = express();

// Middleware
app.use(cors({
  origin: ['https://geobrief-live.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(dbMiddleware); // Verify database connection on every request with fast timeout failure
app.use(rateLimiter(50, 60 * 1000)); // Apply global rate limit (50 reqs/min)

// Routes (Mount both prefix and prefix-less to protect against deployment mismatches)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/incidents', incidentRoutes);
app.use('/incidents', incidentRoutes);

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/groups', groupRoutes);
app.use('/groups', groupRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

// Status routes
app.get('/api/status', (req: Request, res: Response) => {
    res.status(200).json({ message: "GeoBrief-Live API is running smoothly!" });
});
app.get('/status', (req: Request, res: Response) => {
    res.status(200).json({ message: "GeoBrief-Live API is running smoothly!" });
});

export default app;
