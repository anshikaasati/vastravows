import { sendEmail } from '../services/emailService.js';
import { otpTemplate } from '../templates/emailTemplates.js';

// Generate 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email
export const sendOTPEmail = async (email, otp, purpose = 'registration') => {
    try {
        const htmlContent = otpTemplate({ otp, purpose });
        const subject = purpose === 'registration' ? 'Account Registration OTP - Vastra Vows' : 'Verify Email - Vastra Vows';

        await sendEmail({
            to: email,
            subject,
            html: htmlContent
        });

        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

// Send OTP via SMS/WhatsApp using Twilio
export const sendOTPSMS = async (phone, otp) => {
    try {
        // Initialize Twilio if available
        let twilioClient = null;
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            const twilio = await import('twilio');
            twilioClient = twilio.default(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
        }

        if (!twilioClient) {
            console.log('Twilio not configured - SMS OTP not sent');
            // In development, you might want to log the OTP instead
            console.log(`[DEV] Phone OTP for ${phone}: ${otp}`);
            return false;
        }

        // Format phone number (ensure it starts with +)
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

        // Try WhatsApp first, fallback to SMS
        const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
        const smsNumber = process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER;

        const message = `Your Vastra Vows registration OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`;

        try {
            // Try WhatsApp
            if (whatsappNumber) {
                await twilioClient.messages.create({
                    from: `whatsapp:${whatsappNumber}`,
                    to: `whatsapp:${formattedPhone}`,
                    body: message
                });
                console.log(`OTP WhatsApp sent to ${formattedPhone}`);
                return true;
            }
        } catch (whatsappError) {
            console.log('WhatsApp failed, trying SMS:', whatsappError.message);
        }

        // Fallback to SMS
        if (smsNumber) {
            await twilioClient.messages.create({
                from: smsNumber,
                to: formattedPhone,
                body: message
            });
            console.log(`OTP SMS sent to ${formattedPhone}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error sending OTP SMS:', error);
        // In development, log the OTP
        console.log(`[DEV] Phone OTP for ${phone}: ${otp}`);
        return false;
    }
};

