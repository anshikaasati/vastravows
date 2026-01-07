
import nodemailer from 'nodemailer';

/**
 * Centralized Email Service
 * Handles all email sending using NodeMailer with a production-ready configuration.
 */

// 1. Create a reusable transporter object using the default SMTP transport
// 1. Create a reusable transporter object using the default SMTP transport
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;
const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const emailPort = parseInt(process.env.EMAIL_PORT || '587');
const emailFrom = process.env.EMAIL_FROM || emailUser;

if (!emailUser || !emailPass) {
    console.warn('[EmailService] WARNING: EMAIL_USER or EMAIL_PASSWORD environment variables are missing!');
    console.warn('[EmailService] Email functionality will not work until these are set.');
}

// Log configuration (Sanitized)
console.log('[EmailService] Initializing with config:');
console.log(`- Host: ${emailHost}`);
console.log(`- Port: ${emailPort}`);
console.log(`- Secure: ${emailPort === 465}`); // Explicitly log what we are inferring
console.log(`- User: ${emailUser ? emailUser.substring(0, 3) + '***' : 'Missing'}`);
console.log(`- From: ${emailFrom}`);

const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    // Force secure=false for ports 587 and 2525 (Brevo/SendGrid/etc usually use STARTTLS)
    secure: emailPort === 465,
    auth: {
        user: emailUser,
        pass: emailPass
    },
    // CRITICAL for Render: Keep family: 4 to force IPv4
    family: 4,
    // Keep performance/reliability settings
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 30000,
    greetingTimeout: 30000
});

/**
 * Generic send email function
 * @param {Object} options - { to, subject, html, replyTo }
 */
export const sendEmail = async ({ to, subject, html, replyTo }) => {
    try {
        const mailOptions = {
            // Use EMAIL_FROM if set (e.g. verified sender), otherwise fall back to EMAIL_USER
            from: `Vastra Vows <${emailFrom}>`,
            to,
            subject,
            html,
            replyTo
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Email sent successfully: ${info.messageId} to ${to}`);
        return info;
    } catch (error) {
        console.error('[EmailService] Error sending email:', error);
        // Throw error so controllers know it failed, or handle gracefully based on logic
        throw error;
    }
};

/**
 * Verify Setup
 * Verify connection configuration
 */
export const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('[EmailService] Server is ready to take our messages');
        return true;
    } catch (error) {
        console.error('[EmailService] Connection verification failed:', error);
        return false;
    }
};
