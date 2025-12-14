import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendUserRegistrationNotification, sendUserDeletionNotification } from '../utils/notificationService.js';

export const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const { name, email, password, phone, avatarUrl } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400);
      return next(new Error('Email already registered'));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, phone, avatarUrl });

    // Send notification to admin (non-blocking)
    sendUserRegistrationNotification(user).catch(err => 
      console.error('Failed to send registration notification:', err)
    );

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
        isLenderEnabled: user.isLenderEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user.toObject ? req.user.toObject() : req.user;
    res.json({ ...user, id: user._id });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const updates = {};
    ['name', 'phone', 'avatarUrl'].forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true
    }).select('-passwordHash');

    res.json({ ...updatedUser.toObject(), id: updatedUser._id });
  } catch (error) {
    next(error);
  }
};

// Toggle Lender Role
export const toggleLenderRole = async (req, res, next) => {
  try {
    const { enable } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.isLenderEnabled = enable;

    if (enable) {
      if (!user.roles.includes('lender')) {
        user.roles.push('lender');
      }
    } else {
      user.roles = user.roles.filter(role => role !== 'lender');
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({
      message: enable ? 'Lender mode enabled' : 'Lender mode disabled',
      user: { ...userResponse, id: userResponse._id }
    });
  } catch (error) {
    next(error);
  }
};

// Delete Account (Hard Delete - removes all data)
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Import models for cleanup
    const Item = (await import('../models/Item.js')).default;
    const Booking = (await import('../models/Booking.js')).default;
    const Wishlist = (await import('../models/Wishlist.js')).default;

    // Delete all user's items
    await Item.deleteMany({ ownerId: userId });

    // Delete all bookings (as renter)
    await Booking.deleteMany({ renterId: userId });

    // Delete wishlist entries
    await Wishlist.deleteMany({ userId: userId });

    // Send notification to admin before deleting (non-blocking)
    sendUserDeletionNotification(user).catch(err => 
      console.error('Failed to send deletion notification:', err)
    );

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    next(error);
  }
};
