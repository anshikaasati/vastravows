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

    // Send email to Admin (or Site Owner)
    // AND/OR send to a dedicated support email. 
    // The original code sent TO vastravows@gmail.com FROM vastravows@gmail.com, with replyTo as user's email.
    await sendEmail({
      to: process.env.EMAIL_USER || 'vastravows@gmail.com',
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
