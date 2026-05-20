import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
  throw new Error("FATAL ERROR: GOOGLE_CLIENT_ID or JWT_SECRET is missing from the environment.");
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Early input validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ message: 'Name is required' });
      return;
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({ message: 'A valid email is required' });
      return;
    }
    if (!password || typeof password !== 'string' || password.trim().length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim(),
      passwordHash: password,
      authProvider: 'local'
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Early input validation
    if (!email || typeof email !== 'string' || email.trim() === '') {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      res.status(400).json({ message: 'Password is required' });
      return;
    }

    const user = await User.findOne({ email: email.trim() });

    if (user && user.passwordHash && (await user.comparePassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ message: 'Invalid Google token' });
      return;
    }

    const { email, name, sub: googleId } = payload;
    let user = await User.findOne({ email });

    // Prevent Google login from hijacking an existing local account
    if (user && user.authProvider !== 'google') {
      res.status(400).json({ message: 'Email already registered. Please login using your password.' });
      return;
    }

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        authProvider: 'google',
        googleId,
      });
    }

    // Return OUR local JWT
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
};