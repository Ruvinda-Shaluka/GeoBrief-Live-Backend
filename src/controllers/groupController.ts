import { Response } from "express";
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
    res.status(500).json({ message: "Server error adding member" });
  }
};
