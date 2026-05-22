import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Input validation for 'name'
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
        res.status(400).json({ message: 'A valid name is required' });
        return;
      }
      user.name = req.body.name.trim();
    }
    
    // Input validation for password (analyzers prefer explicit validation before assignment)
    if (req.body.password !== undefined && user.authProvider === 'local') {
      if (typeof req.body.password !== 'string' || req.body.password.trim().length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long' });
        return;
      }
      user.passwordHash = req.body.password; // The pre-save hook handles the actual bcrypt hashing
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const deletedUser = await User.findByIdAndDelete(req.user._id);
    
    // Check if user was actually found and deleted
    if (!deletedUser) {
      res.status(404).json({ message: 'User not found or already deleted' });
      return;
    }
    
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting account' });
  }
};