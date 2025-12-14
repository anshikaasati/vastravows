import mongoose from 'mongoose';

const registrationOTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: false, // TODO: Set to true when Twilio is configured
        trim: true,
        default: ''
    },
    emailOTP: {
        type: String,
        required: true
    },
    phoneOTP: {
        type: String,
        required: false, // TODO: Set to true when Twilio is configured
        default: '000000'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
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
registrationOTPSchema.index({ email: 1, emailOTP: 1 });
// TODO: Uncomment when Twilio is configured
// registrationOTPSchema.index({ email: 1, phone: 1 });
// registrationOTPSchema.index({ phone: 1, phoneOTP: 1 });

const RegistrationOTP = mongoose.model('RegistrationOTP', registrationOTPSchema);

export default RegistrationOTP;

