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

    // 1. Update Name
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
        res.status(400).json({ message: 'A valid name is required' });
        return;
      }
      user.name = req.body.name.trim();
    }
    
    // 2. Securely Update Password
    if (req.body.newPassword && user.authProvider === 'local') {
      // Require the current password for security
      if (!req.body.currentPassword) {
        res.status(400).json({ message: 'Current password is required to set a new password' });
        return;
      }

      // Verify the current password
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        res.status(400).json({ message: 'Incorrect current password' });
        return;
      }

      // Validate new password length
      if (typeof req.body.newPassword !== 'string' || req.body.newPassword.trim().length < 6) {
        res.status(400).json({ message: 'New password must be at least 6 characters long' });
        return;
      }

      user.passwordHash = req.body.newPassword; 
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      picture: updatedUser.picture, 
      authProvider: updatedUser.authProvider, // Added this
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