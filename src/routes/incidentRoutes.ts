import express from 'express';
import { createIncident, getIncidents, toggleUpvote, getPublicIncidents } from '../controllers/incidentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public', getPublicIncidents);

router.route('/')
  .post(protect, createIncident)
  .get(protect, getIncidents);

router.put('/:id/upvote', protect, toggleUpvote);

export default router;