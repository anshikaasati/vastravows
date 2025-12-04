import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Update lender verification details
export const updateLenderVerification = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            address,
            idProofType,
            idProofNumber
        } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update address
        if (address) {
            user.address = {
                street: address.street || user.address?.street,
                city: address.city || user.address?.city,
                state: address.state || user.address?.state,
                pincode: address.pincode || user.address?.pincode,
                country: address.country || user.address?.country || 'India'
            };
        }

        // Update ID proof details
        if (idProofType) user.idProofType = idProofType;
        if (idProofNumber) user.idProofNumber = idProofNumber;

        // Handle profile photo upload
        if (req.files?.profilePhoto) {
            const uploadResult = await uploadToCloudinary(req.files.profilePhoto[0].buffer);
            user.profilePhoto = uploadResult.secure_url;
        }

        // Handle ID proof document upload
        if (req.files?.idProofDocument) {
            const uploadResult = await uploadToCloudinary(req.files.idProofDocument[0].buffer);
            user.idProofDocument = uploadResult.secure_url;
        }

        await user.save();

        res.json({
            message: 'Verification details updated successfully',
            user: {
                address: user.address,
                profilePhoto: user.profilePhoto,
                idProofType: user.idProofType,
                idProofNumber: user.idProofNumber,
                idProofDocument: user.idProofDocument,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Update Verification Error:', error);
        res.status(500).json({ message: 'Failed to update verification details', error: error.message });
    }
};

// Admin: Verify a lender
export const verifyLender = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isVerified } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isVerified = isVerified;
        if (isVerified) {
            user.verifiedAt = new Date();
        }

        await user.save();

        res.json({
            message: `Lender ${isVerified ? 'verified' : 'unverified'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                isVerified: user.isVerified,
                verifiedAt: user.verifiedAt
            }
        });
    } catch (error) {
        console.error('Verify Lender Error:', error);
        res.status(500).json({ message: 'Failed to verify lender', error: error.message });
    }
};
