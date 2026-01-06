
import nodemailer from 'nodemailer';

/**
 * Centralized Email Service
 * Handles all email sending using NodeMailer with a production-ready configuration.
 */

// 1. Create a reusable transporter object using the default SMTP transport
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPass) {
    console.warn('[EmailService] WARNING: EMAIL_USER or EMAIL_PASSWORD environment variables are missing!');
    console.warn('[EmailService] Email functionality will not work until these are set.');
}

const transporter = nodemailer.createTransport({
    service: 'gmail', // Automatically handles host, port (465/587), and security settings for Gmail
    auth: {
        user: emailUser,
        pass: emailPass
    },
    // Keep performance/reliability settings
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Increase timeout to avoid spurious timeouts
    connectionTimeout: 20000,
    greetingTimeout: 20000
    // Note: We removed 'family: 4' to let Node/Nodemailer decide the best route. 
    // If timeouts persist, we can add it back, but 'service: gmail' usually handles it well.
});

/**
 * Generic send email function
 * @param {Object} options - { to, subject, html, replyTo }
 */
export const sendEmail = async ({ to, subject, html, replyTo }) => {
    try {
        const mailOptions = {
            from: `Vastra Vows <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            replyTo
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Email sent: ${info.messageId} to ${to}`);
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
