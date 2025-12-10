import pkg from 'nodemailer';
const { createTransport } = pkg;

export const sendContactEmail = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      res.status(400);
      return next(new Error('All fields are required'));
    }

    // Create transporter using Gmail
    // Note: You'll need to set up App Password in Gmail for this to work
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'vastravows@gmail.com',
        pass: process.env.EMAIL_PASSWORD // This should be an App Password from Gmail
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'vastravows@gmail.com',
      to: 'vastravows@gmail.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #800000;">New Contact Form Submission</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background: white; padding: 20px; border-left: 4px solid #800000;">
            <h3 style="color: #800000;">Message:</h3>
            <p style="line-height: 1.6;">${message}</p>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from the Vastra Vows contact form.<br>
            Reply directly to this email to respond to ${name} at ${email}
          </p>
        </div>
      `,
      replyTo: email
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    next(error);
  }
};
