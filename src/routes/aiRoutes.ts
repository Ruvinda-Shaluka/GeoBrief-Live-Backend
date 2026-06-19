import express from 'express';
import { generateBrief, generateSafetyTip } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/brief', protect, generateBrief);
router.post('/safety-tip', protect, generateSafetyTip);

export default router;
