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

// @desc    Toggle upvote on an incident
// @route   PUT /api/incidents/:id/upvote
// @access  Private
export const toggleUpvote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const incidentId = req.params.id;
    const userId = req.user._id;

    // 1. Fetch incident first to check authorization
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      res.status(404).json({ message: 'Incident not found' });
      return;
    }

    // 2. Missing authorization check: Verify visibility before allowing upvote
    if (incident.visibility === 'private' && incident.reportedBy.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Not authorized to interact with this private incident' });
      return;
    }

    if (incident.visibility === 'group') {
      const userGroups = await Group.find({ members: userId }).select('_id');
      const userGroupIds = userGroups.map(g => g._id.toString());
      const hasAccess = incident.sharedWithGroups.some(gId => userGroupIds.includes(gId.toString()));
      
      if (!hasAccess) {
        res.status(403).json({ message: 'Not authorized to interact with this group incident' });
        return;
      }
    }

    // 3. Race condition fix: Use atomic MongoDB operators instead of array.push/filter
    const hasUpvoted = incident.upvotes.some((id) => id.toString() === userId.toString());

    let updatedIncident;
    if (hasUpvoted) {
      // $pull safely removes the ID directly in the database
      updatedIncident = await Incident.findByIdAndUpdate(
        incidentId,
        { $pull: { upvotes: userId } },
        { new: true } // Returns the updated document
      ).populate('reportedBy', 'name');
    } else {
      // $addToSet safely adds the ID only if it doesn't already exist
      updatedIncident = await Incident.findByIdAndUpdate(
        incidentId,
        { $addToSet: { upvotes: userId } },
        { new: true }
      ).populate('reportedBy', 'name');
    }

    res.status(200).json(updatedIncident);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating upvote' });
  }
};