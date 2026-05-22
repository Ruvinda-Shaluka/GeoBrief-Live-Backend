import express from 'express';
import { createIncident, getIncidents } from '../controllers/incidentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createIncident)
  .get(protect, getIncidents);

export default router;