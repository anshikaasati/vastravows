import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import RegistrationOTP from '../models/RegistrationOTP.js';
import { generateToken } from '../utils/generateToken.js';
import { sendUserRegistrationNotification, sendUserDeletionNotification } from '../utils/notificationService.js';
import { generateOTP, sendOTPEmail, sendOTPSMS } from '../utils/otpService.js';

// Send registration OTPs (email and phone)
export const sendRegistrationOTPs = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!email) {
      res.status(400);
      return next(new Error('Email is required'));
    }

    // TODO: Uncomment when Twilio is configured
    // if (!email || !phone) {
    //   res.status(400);
    //   return next(new Error('Email and phone number are required'));
    // }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase()
      // TODO: Uncomment when Twilio is configured
      // $or: [
      //   { email: email.toLowerCase() },
      //   { phone: phone.trim() }
      // ]
    });

    if (existingUser) {
      res.status(400);
      return next(new Error('Email already registered'));
      // TODO: Uncomment when Twilio is configured
      // return next(new Error('Email or phone number already registered'));
    }

    // Check rate limiting (max 3 OTP requests per hour per email)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOTPs = await RegistrationOTP.countDocuments({
      email: email.toLowerCase(),
      createdAt: { $gte: oneHourAgo }
      // TODO: Uncomment when Twilio is configured
      // $or: [
      //   { email: email.toLowerCase(), createdAt: { $gte: oneHourAgo } },
      //   { phone: phone.trim(), createdAt: { $gte: oneHourAgo } }
      // ]
    });

    if (recentOTPs >= 3) {
      res.status(429);
      return next(new Error('Too many OTP requests. Please try again later.'));
    }

    // Generate OTPs
    const emailOTP = generateOTP();
    // TODO: Uncomment when Twilio is configured
    // const phoneOTP = generateOTP();

    // Delete any existing OTPs for this email
    await RegistrationOTP.deleteMany({
      email: email.toLowerCase()
      // TODO: Uncomment when Twilio is configured
      // $or: [
      //   { email: email.toLowerCase() },
      //   { phone: phone.trim() }
      // ]
    });

    // Save OTPs to database (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await RegistrationOTP.create({
      email: email.toLowerCase(),
      phone: phone || '', // Store phone if provided, but don't require it
      emailOTP,
      phoneOTP: '000000', // Placeholder - TODO: Uncomment when Twilio is configured: phoneOTP,
      expiresAt
    });

    // Send OTPs (non-blocking)
    Promise.all([
      sendOTPEmail(email, emailOTP, 'registration')
      // TODO: Uncomment when Twilio is configured
      // sendOTPSMS(phone, phoneOTP)
    ]).catch(err => {
      console.error('Error sending OTPs:', err);
    });

    res.status(200).json({
      message: 'OTP sent successfully. Please check your email.',
      // TODO: Uncomment when Twilio is configured
      // message: 'OTPs sent successfully. Please check your email and phone.',
      email: email.toLowerCase()
    });
  } catch (error) {
    console.error('Send registration OTP error:', error);
    next(error);
  }
};

// Verify registration OTPs
export const verifyRegistrationOTPs = async (req, res, next) => {
  try {
    const { email, phone, emailOTP, phoneOTP } = req.body;

    if (!email || !emailOTP) {
      res.status(400);
      return next(new Error('Email and email OTP are required'));
    }

    // TODO: Uncomment when Twilio is configured
    // if (!email || !phone || !emailOTP || !phoneOTP) {
    //   res.status(400);
    //   return next(new Error('Email, phone, and both OTPs are required'));
    // }

    // Find registration OTP record
    const registrationOTP = await RegistrationOTP.findOne({
      email: email.toLowerCase()
      // TODO: Uncomment when Twilio is configured
      // phone: phone.trim()
    });

    if (!registrationOTP) {
      res.status(400);
      return next(new Error('OTP not found. Please request a new OTP.'));
    }

    // Check if OTP has expired
    if (new Date() > registrationOTP.expiresAt) {
      await RegistrationOTP.deleteOne({ _id: registrationOTP._id });
      res.status(400);
      return next(new Error('OTP has expired. Please request a new OTP.'));
    }

    // Verify email OTP
    if (registrationOTP.emailOTP !== emailOTP.trim()) {
      res.status(400);
      return next(new Error('Invalid email OTP'));
    }

    // TODO: Uncomment when Twilio is configured
    // // Verify phone OTP
    // if (registrationOTP.phoneOTP !== phoneOTP.trim()) {
    //   res.status(400);
    //   return next(new Error('Invalid phone OTP'));
    // }

    // Mark OTP as verified
    registrationOTP.emailVerified = true;
    registrationOTP.phoneVerified = true; // Auto-verify phone when Twilio is disabled
    // TODO: Uncomment when Twilio is configured
    // registrationOTP.phoneVerified = true;
    await registrationOTP.save();

    res.status(200).json({
      message: 'OTP verified successfully',
      email: email.toLowerCase()
      // TODO: Uncomment when Twilio is configured
      // phone: phone.trim()
    });
  } catch (error) {
    console.error('Verify registration OTP error:', error);
    next(error);
  }
};

// Complete registration (after OTP verification)
export const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const { name, email, password, phone, avatarUrl, emailOTP, phoneOTP } = req.body;

    // Verify OTP is provided
    if (!emailOTP) {
      res.status(400);
      return next(new Error('Email OTP is required'));
    }

    // TODO: Uncomment when Twilio is configured
    // if (!emailOTP || !phoneOTP) {
    //   res.status(400);
    //   return next(new Error('Email and phone OTPs are required'));
    // }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase()
      // TODO: Uncomment when Twilio is configured
      // $or: [
      //   { email: email.toLowerCase() },
      //   { phone: phone.trim() }
      // ]
    });

    if (existingUser) {
      res.status(400);
      return next(new Error('Email already registered'));
      // TODO: Uncomment when Twilio is configured
      // return next(new Error('Email or phone number already registered'));
    }

    // Verify OTP
    const registrationOTP = await RegistrationOTP.findOne({
      email: email.toLowerCase(),
      emailOTP: emailOTP.trim()
      // TODO: Uncomment when Twilio is configured
      // phone: phone.trim(),
      // phoneOTP: phoneOTP.trim()
    });

    if (!registrationOTP) {
      res.status(400);
      return next(new Error('Invalid or expired OTP. Please request a new OTP.'));
    }

    if (new Date() > registrationOTP.expiresAt) {
      await RegistrationOTP.deleteOne({ _id: registrationOTP._id });
      res.status(400);
      return next(new Error('OTP has expired. Please request a new OTP.'));
    }

    if (!registrationOTP.emailVerified) {
      res.status(400);
      return next(new Error('OTP not verified. Please verify OTP first.'));
    }

    // TODO: Uncomment when Twilio is configured
    // if (!registrationOTP.emailVerified || !registrationOTP.phoneVerified) {
    //   res.status(400);
    //   return next(new Error('OTPs not verified. Please verify OTPs first.'));
    // }

    // Create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email: email.toLowerCase(), 
      passwordHash, 
      phone: phone.trim(), 
      avatarUrl 
    });

    // Delete used OTP record
    await RegistrationOTP.deleteOne({ _id: registrationOTP._id });

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
