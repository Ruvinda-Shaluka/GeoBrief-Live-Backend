import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware.js";
import Group from "../models/Group.js";
import User from "../models/User.js";

export const createGroup = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Guard against missing authenticated user
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { name, description } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      res.status(400).json({ message: "Group name is required" });
      return;
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim(),
      admin: req.user._id,
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Error in createGroup:", error);
    res.status(500).json({ message: "Server error creating group" });
  }
};

export const getUserGroups = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Guard against missing authenticated user
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const groups = await Group.find({ members: req.user._id })
      .populate("admin", "name email")
      .populate("members", "name email");

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups:", error);
    res.status(500).json({ message: "Server error fetching groups" });
  }
};

export const addMemberToGroup = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Guard against missing authenticated user
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { email } = req.body;
    const groupId = req.params.id;

    // Trim email before validation
    if (!email || typeof email !== "string" || email.trim() === "") {
      res
        .status(400)
        .json({ message: "A valid email is required to add a member" });
      return;
    }

    const trimmedEmail = email.trim();

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Requester ID is now safely guaranteed by the guard above
    if (group.admin.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "Only the group admin can add members" });
      return;
    }

    // Use trimmed email for lookup
    const userToAdd = await User.findOne({ email: trimmedEmail });
    if (!userToAdd) {
      res
        .status(404)
        .json({ message: "No user found with that email address" });
      return;
    }

    if (
      group.members.some(
        (memberId) => memberId.toString() === userToAdd._id.toString(),
      )
    ) {
      res
        .status(400)
        .json({ message: "User is already a member of this group" });
      return;
    }

    group.members.push(userToAdd._id);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "name email")
      .populate("members", "name email");

    // Add null check for re-fetched group
    if (!updatedGroup) {
      res
        .status(404)
        .json({ message: "Error retrieving the updated group details" });
      return;
    }

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in addMemberToGroup:", error);
    res.status(500).json({ message: "Server error adding member" });
  }
};

export const makeGroupAdmin = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Guard against missing authenticated user
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { newAdminId } = req.body;
    const groupId = req.params.id;

    if (!newAdminId || typeof newAdminId !== "string" || newAdminId.trim() === "") {
      res.status(400).json({ message: "New admin user ID is required" });
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Verify requesting user is current group admin
    if (group.admin.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "Only the current group admin can transfer ownership" });
      return;
    }

    // Verify new admin is a member of the group
    const isMember = group.members.some(
      (memberId) => memberId.toString() === newAdminId.toString(),
    );
    if (!isMember) {
      res.status(400).json({ message: "New admin must be a member of the group" });
      return;
    }

    // Update the admin field
    group.admin = new mongoose.Types.ObjectId(newAdminId);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "name email")
      .populate("members", "name email");

    if (!updatedGroup) {
      res.status(404).json({ message: "Error retrieving the updated group details" });
      return;
    }

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in makeGroupAdmin:", error);
    res.status(500).json({ message: "Server error transferring admin ownership" });
  }
};

export const removeMemberFromGroup = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { memberId } = req.params;
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Only admin can remove members
    if (group.admin.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "Only the group admin can remove members" });
      return;
    }

    // Admin cannot remove themselves
    if (memberId.toString() === group.admin.toString()) {
      res.status(400).json({ message: "Group admin cannot be removed. Transfer ownership first." });
      return;
    }

    // Check if member exists in the group
    const isMember = group.members.some(
      (mId) => mId.toString() === memberId.toString(),
    );
    if (!isMember) {
      res.status(400).json({ message: "User is not a member of this group" });
      return;
    }

    // Pull member
    group.members = group.members.filter(
      (mId) => mId.toString() !== memberId.toString(),
    ) as mongoose.Types.ObjectId[];

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "name email")
      .populate("members", "name email");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in removeMemberFromGroup:", error);
    res.status(500).json({ message: "Server error removing member" });
  }
};

export const leaveGroup = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const groupId = req.params.id;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Verify requesting user is indeed a member
    const isMember = group.members.some(
      (mId) => mId.toString() === userId.toString(),
    );
    if (!isMember) {
      res.status(400).json({ message: "You are not a member of this group" });
      return;
    }

    // Group admin cannot leave without transferring ownership
    if (group.admin.toString() === userId.toString()) {
      res.status(400).json({ message: "Group admin cannot leave the group. Transfer ownership first." });
      return;
    }

    // Remove user from members
    group.members = group.members.filter(
      (mId) => mId.toString() !== userId.toString(),
    ) as mongoose.Types.ObjectId[];

    await group.save();

    res.status(200).json({ message: "Successfully left the group" });
  } catch (error) {
    console.error("Error in leaveGroup:", error);
    res.status(500).json({ message: "Server error leaving group" });
  }
};
