import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import bcrypt from 'bcryptjs';
import { createEmailTransporter } from '../utils/emailTransporter.js';

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email to user
const sendOTPEmail = async (email, otp) => {
    const transporter = createEmailTransporter();

    const mailOptions = {
        from: process.env.EMAIL_USER || 'vastravows@gmail.com',
        to: email, // Send to user's email
        subject: 'Password Reset OTP - Vastra Vows',
        html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #800000; font-family: 'Playfair Display', serif; margin: 0;">Vastra Vows</h1>
          <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Luxe Rentals</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fff 0%, #fff1f2 100%); border: 1px solid #800000; border-radius: 12px; padding: 30px; margin: 20px 0;">
          <h2 style="color: #800000; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #333; line-height: 1.6;">We received a request to reset your password. Use the OTP below to proceed:</p>
          
          <div style="background: white; border: 2px dashed #800000; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <p style="color: #666; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP</p>
            <p style="font-size: 32px; font-weight: bold; color: #800000; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            <strong>This OTP will expire in 10 minutes.</strong><br>
            If you didn't request this password reset, please ignore this email or contact us if you have concerns.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px; margin: 5px 0;">
            © ${new Date().getFullYear()} Vastra Vows. All rights reserved.
          </p>
          <p style="color: #999; font-size: 11px; margin: 5px 0;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
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
