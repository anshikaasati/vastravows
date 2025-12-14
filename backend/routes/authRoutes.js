import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getMe, updateMe, toggleLenderRole, deleteAccount } from '../controllers/authController.js';
import { forgotPassword, verifyOTP, resetPassword } from '../controllers/passwordResetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Existing auth routes
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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
router.put('/me', protect, updateMe);
router.post('/toggle-lender', protect, toggleLenderRole);
router.delete('/delete-account', protect, deleteAccount);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;
