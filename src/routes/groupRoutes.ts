import express from 'express';
import { createGroup, getUserGroups, addMemberToGroup, makeGroupAdmin } from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createGroup)
  .get(protect, getUserGroups);

router.route('/:id/members')
  .post(protect, addMemberToGroup);

router.route('/:id/admin')
  .put(protect, makeGroupAdmin);

export default router;
