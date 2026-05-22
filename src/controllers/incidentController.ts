import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import Incident from '../models/Incident.js';
import Group from '../models/Group.js';

export const createIncident = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Defensive validation for authenticated user
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { title, description, type, visibility, sharedWithGroups, coordinates } = req.body;

    // 2. Validate required fields
    if (!title || !description || !type) {
      res.status(400).json({ message: 'Title, description, and type are required' });
      return;
    }

    // 3. Validate group-specific requirements
    if (visibility === 'group' && (!sharedWithGroups || !Array.isArray(sharedWithGroups) || sharedWithGroups.length === 0)) {
      res.status(400).json({ message: 'At least one group must be specified when visibility is set to group' });
      return;
    }

    // 4. Strengthen coordinate validation (must be array of exactly 2 numbers)
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2 || typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
      res.status(400).json({ message: 'Valid numeric coordinates [longitude, latitude] are required' });
      return;
    }

    const incident = await Incident.create({
      title: title.trim(),
      description: description.trim(),
      type: type.trim(),
      visibility,
      sharedWithGroups: visibility === 'group' ? sharedWithGroups : [],
      location: {
        type: 'Point',
        coordinates, 
      },
      reportedBy: req.user._id, 
    });

    res.status(201).json(incident);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error creating incident' });
  }
};

export const getIncidents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Defensive validation for authenticated user
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userId = req.user._id;

    const userGroups = await Group.find({ members: userId }).select('_id');
    const userGroupIds = userGroups.map(group => group._id);

    const incidents = await Incident.find({
      $or: [
        { visibility: 'public' }, 
        { visibility: 'private', reportedBy: userId }, 
        { visibility: 'group', sharedWithGroups: { $in: userGroupIds } } 
      ]
    }).populate('reportedBy', 'name'); 

    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching incidents' });
  }
};