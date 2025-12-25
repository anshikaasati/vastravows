import express from 'express';
import { body } from 'express-validator';
import { sendRegistrationOTPs, verifyRegistrationOTPs, registerUser, loginUser, getMe, updateMe, toggleLenderRole, deleteAccount } from '../controllers/authController.js';
import { forgotPassword, verifyOTP, resetPassword } from '../controllers/passwordResetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strong password validation
const strongPasswordValidation = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');

// Registration OTP routes
router.post(
  '/register/send-otp',
  [
    body('email').isEmail().withMessage('Valid email is required')
    // TODO: Uncomment when Twilio is configured
    // body('phone').notEmpty().withMessage('Phone number is required'),
    // body('phone').matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).withMessage('Valid phone number is required')
  ],
  sendRegistrationOTPs
);

router.post(
  '/register/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('emailOTP').isLength({ min: 6, max: 6 }).withMessage('Email OTP must be 6 digits')
    // TODO: Uncomment when Twilio is configured
    // body('phone').notEmpty().withMessage('Phone number is required'),
    // body('phoneOTP').isLength({ min: 6, max: 6 }).withMessage('Phone OTP must be 6 digits')
  ],
  verifyRegistrationOTPs
);

// Complete registration (after OTP verification)
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    strongPasswordValidation,
    body('emailOTP').isLength({ min: 6, max: 6 }).withMessage('Email OTP must be 6 digits')
    // TODO: Uncomment when Twilio is configured
    // body('phone').notEmpty().withMessage('Phone number is required'),
    // body('phone').matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).withMessage('Valid phone number is required'),
    // body('phoneOTP').isLength({ min: 6, max: 6 }).withMessage('Phone OTP must be 6 digits')
  ],
  registerUser
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  loginUser
);

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.patch('/toggle-lender', protect, toggleLenderRole);
router.delete('/delete-account', protect, deleteAccount);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;
