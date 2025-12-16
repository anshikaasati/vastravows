import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - automatically deletes expired documents
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups
passwordResetSchema.index({ email: 1, otp: 1 });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

export default PasswordReset;
