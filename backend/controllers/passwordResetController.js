import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../services/emailService.js';
import { otpTemplate } from '../templates/emailTemplates.js';

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email to user
const sendOTPEmail = async (email, otp) => {
    const htmlContent = otpTemplate({ otp, purpose: 'reset' });

    await sendEmail({
        to: email,
        subject: 'Password Reset OTP - Vastra Vows',
        html: htmlContent
    });
};

// Request password reset (send OTP)
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400);
            return next(new Error('Email is required'));
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(404);
            return next(new Error('No account found with this email'));
        }

        // Check rate limiting (max 3 OTPs per hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentOTPs = await PasswordReset.countDocuments({
            email: email.toLowerCase(),
            createdAt: { $gte: oneHourAgo }
        });

        if (recentOTPs >= 3) {
            res.status(429);
            return next(new Error('Too many OTP requests. Please try again later.'));
        }

        // Generate OTP
        const otp = generateOTP();

        // Delete any existing OTPs for this email
        await PasswordReset.deleteMany({ email: email.toLowerCase() });

        // Save OTP to database (expires in 10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await PasswordReset.create({
            email: email.toLowerCase(),
            otp,
            expiresAt
        });

        // Send OTP email
        await sendOTPEmail(email, otp);

        res.status(200).json({
            message: 'OTP sent to your email. Please check your inbox.',
            email: email.toLowerCase()
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        next(error);
    }
};

// Verify OTP
export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            res.status(400);
            return next(new Error('Email and OTP are required'));
        }

        // Find valid OTP
        const passwordReset = await PasswordReset.findOne({
            email: email.toLowerCase(),
            otp: otp.trim()
        });

        if (!passwordReset) {
            res.status(400);
            return next(new Error('Invalid OTP'));
        }

        // Check if OTP has expired
        if (new Date() > passwordReset.expiresAt) {
            await PasswordReset.deleteOne({ _id: passwordReset._id });
            res.status(400);
            return next(new Error('OTP has expired. Please request a new one.'));
        }

        res.status(200).json({
            message: 'OTP verified successfully',
            email: email.toLowerCase()
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        next(error);
    }
};

// Reset password
export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            res.status(400);
            return next(new Error('Email, OTP, and new password are required'));
        }

        if (newPassword.length < 6) {
            res.status(400);
            return next(new Error('Password must be at least 6 characters long'));
        }

        // Verify OTP one final time
        const passwordReset = await PasswordReset.findOne({
            email: email.toLowerCase(),
            otp: otp.trim()
        });

        if (!passwordReset) {
            res.status(400);
            return next(new Error('Invalid OTP'));
        }

        if (new Date() > passwordReset.expiresAt) {
            await PasswordReset.deleteOne({ _id: passwordReset._id });
            res.status(400);
            return next(new Error('OTP has expired. Please request a new one.'));
        }

        // Find user and update password
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(404);
            return next(new Error('User not found'));
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update passwordHash field (not password)
        user.passwordHash = hashedPassword;
        await user.save();

        // Delete used OTP
        await PasswordReset.deleteOne({ _id: passwordReset._id });

        res.status(200).json({ message: 'Password reset successfully. You can now login with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        next(error);
    }
};
