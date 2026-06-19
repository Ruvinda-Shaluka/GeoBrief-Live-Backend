import express from 'express';
import { generateBrief } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/brief', protect, generateBrief);

export default router;
