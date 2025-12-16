import pkg from 'nodemailer';
const { createTransport } = pkg;

// Create centralized email transporter
// Using port 587 with secure: false (STARTTLS) is often more reliable in cloud environments
// than port 465 to avoid timeouts.
export const createEmailTransporter = () => {
    return createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER || 'vastravows@gmail.com',
            pass: process.env.EMAIL_PASSWORD
        }
    });
};
