import { createEmailTransporter } from './emailTransporter.js';

// Generate 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email
export const sendOTPEmail = async (email, otp, purpose = 'registration') => {
    try {
        const transporter = createEmailTransporter();

        const purposeText = purpose === 'registration' ? 'Account Registration' : 'Verification';
        const purposeDescription = purpose === 'registration'
            ? 'Complete your account registration'
            : 'Verify your email address';

        const mailOptions = {
            from: process.env.EMAIL_USER || 'vastravows@gmail.com',
            to: email,
            subject: `${purposeText} OTP - Vastra Vows`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #800000; font-family: 'Playfair Display', serif; margin: 0;">Vastra Vows</h1>
                        <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Luxe Rentals</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #fff 0%, #fff1f2 100%); border: 1px solid #800000; border-radius: 12px; padding: 30px; margin: 20px 0;">
                        <h2 style="color: #800000; margin-top: 0;">${purposeText}</h2>
                        <p style="color: #333; line-height: 1.6;">Use the OTP below to ${purposeDescription}:</p>
                        
                        <div style="background: white; border: 2px dashed #800000; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                            <p style="color: #666; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP</p>
                            <p style="font-size: 32px; font-weight: bold; color: #800000; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</p>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; line-height: 1.6;">
                            <strong>This OTP will expire in 10 minutes.</strong><br>
                            If you didn't request this, please ignore this email or contact us if you have concerns.
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
        console.log(`OTP email sent to ${email}`);
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

