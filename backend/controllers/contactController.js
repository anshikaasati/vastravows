// import { createEmailTransporter } from '../utils/emailTransporter.js'; // Removed old import
import { sendEmail } from '../services/emailService.js';
import { contactFormTemplate } from '../templates/emailTemplates.js';

export const sendContactEmail = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      res.status(400);
      return next(new Error('All fields are required'));
    }

    // Generate HTML using template
    const htmlContent = contactFormTemplate({ name, email, subject, message });

    // Send email to Admin
    // Priority: ADMIN_EMAIL > EMAIL_FROM > Hardcoded fallback
    // CRITICAL: Do NOT use EMAIL_USER as it might be an SMTP ID (like in Brevo)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'vastravows@gmail.com';

    await sendEmail({
      to: adminEmail,
      subject: `Contact Form: ${subject}`,
      html: htmlContent,
      replyTo: email
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    next(error);
  }
};
