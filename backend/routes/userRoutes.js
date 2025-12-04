import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { updateLenderVerification, verifyLender } from '../controllers/userController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Update lender verification details (with file uploads)
router.patch(
    '/verification',
    protect,
    upload.fields([
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'idProofDocument', maxCount: 1 }
    ]),
    updateLenderVerification
);

// Admin: Verify a lender
router.patch('/verify/:userId', protect, verifyLender);

export default router;
