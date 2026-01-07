
/**
 * Email Templates
 * Centralized templates to ensure consistent branding and styling.
 */

const header = `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #800000; font-family: 'Playfair Display', serif; margin: 0;">Vastra Vows</h1>
      <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Luxe Rentals</p>
    </div>
`;

const footer = `
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      <p style="color: #999; font-size: 12px; margin: 5px 0;">
        © ${new Date().getFullYear()} Vastra Vows. All rights reserved.
      </p>
      <p style="color: #999; font-size: 11px; margin: 5px 0;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  </div>
`;

/**
 * Contact Form Template
 */
export const contactFormTemplate = ({ name, email, subject, message }) => {
  return `
    ${header}
    <div style="background: linear-gradient(135deg, #fff 0%, #fff1f2 100%); border: 1px solid #800000; border-radius: 12px; padding: 30px; margin: 20px 0;">
      <h2 style="color: #800000; margin-top: 0;">New Contact Form Submission</h2>
      <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
        <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
      </div>
      <div style="background: white; padding: 20px; border-left: 4px solid #800000; margin-top: 20px;">
        <h3 style="color: #800000; margin-top: 0;">Message:</h3>
        <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
      </div>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Reply directly to this email to respond to ${name}.
      </p>
    </div>
    ${footer}
  `;
};

/**
 * OTP Template (Registration/Password Reset)
 */
export const otpTemplate = ({ otp, purpose }) => {
  const title = purpose === 'registration' ? 'Account Registration' : 'Password Reset';
  const description = purpose === 'registration'
    ? 'Complete your account registration'
    : 'Reset your password';

  return `
    ${header}
    <div style="background: linear-gradient(135deg, #fff 0%, #fff1f2 100%); border: 1px solid #800000; border-radius: 12px; padding: 30px; margin: 20px 0;">
      <h2 style="color: #800000; margin-top: 0;">${title}</h2>
      <p style="color: #333; line-height: 1.6;">Use the OTP below to ${description}:</p>
      
      <div style="background: white; border: 2px dashed #800000; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
        <p style="color: #666; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP</p>
        <p style="font-size: 32px; font-weight: bold; color: #800000; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</p>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        <strong>This OTP will expire in 10 minutes.</strong><br>
        If you didn't request this, please ignore this email.
      </p>
    </div>
    ${footer}
  `;
};

/**
 * Admin Notification: New User
 */
export const newUserNotificationTemplate = ({ name, email, phone, totalUsers }) => {
  return `
    ${header}
    <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #800000; margin-top: 0;">🎉 New User Registered</h2>
        
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">New User Details</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        </div>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Total Active Users:</strong> ${totalUsers}</p>
        </div>
    </div>
    ${footer}
  `;
};

/**
 * Admin Notification: User Deleted
 */
export const userDeletedNotificationTemplate = ({ name, email, phone, totalUsers }) => {
  return `
      ${header}
      <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #800000; margin-top: 0;">🗑️ User Account Deleted</h2>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Deleted User Details</h3>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          </div>
  
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>Remaining Active Users:</strong> ${totalUsers}</p>
          </div>
      </div>
      ${footer}
    `;
};

/**
 * Booking Notification Template
 */
export const bookingNotificationTemplate = ({ booking, item, buyer, bookingType, fullAddress, rentalDays }) => {
  return `
        ${header}
        <div style="background: linear-gradient(135deg, #fff 0%, #fff1f2 100%); border: 2px solid #800000; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #800000; margin-top: 0;">📦 New ${bookingType} Booking Received!</h2>
            <p style="color: #666; font-size: 14px;">Booking ID: <strong>${booking._id}</strong></p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #800000; margin-top: 0;">Item Details</h3>
            <p style="margin: 8px 0;"><strong>Item Name:</strong> ${item.title}</p>
            <p style="margin: 8px 0;"><strong>Size:</strong> ${booking.size || 'N/A'}</p>
            ${bookingType === 'Rental' ? `<p style="margin: 8px 0;"><strong>Rental Price:</strong> ₹${item.rentPricePerDay}/day</p>` : `<p style="margin: 8px 0;"><strong>Sale Price:</strong> ₹${item.salePrice || 0}</p>`}
        </div>

        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">👤 Buyer Information</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${buyer.name || booking.renterName || 'N/A'}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${buyer.email || 'N/A'}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${buyer.phone || booking.phoneNumber || 'Not provided'}</p>
            <p style="margin: 8px 0;"><strong>Delivery Address:</strong><br>${fullAddress || 'Not provided'}</p>
        </div>

        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #059669; margin-top: 0;">📅 Booking Details</h3>
            ${bookingType === 'Rental' ? `
                <p style="margin: 8px 0;"><strong>Rental Period:</strong> ${rentalDays} days</p>
                <p style="margin: 8px 0;"><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
                <p style="margin: 8px 0;"><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
            ` : ''}
            <p style="margin: 8px 0;"><strong>Total Amount:</strong> <span style="font-size: 20px; color: #059669;">₹${booking.totalAmount || 0}</span></p>
            <p style="margin: 8px 0;"><strong>Payment Method:</strong> ${booking.paymentMethod === 'online' ? 'Online Payment' : booking.paymentMethod === 'cod' ? 'Cash on Delivery' : booking.paymentMethod || 'N/A'}</p>
        </div>

        <div style="background: #800000; color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0;">⚡ Action Required</h3>
            <p style="margin: 0; font-size: 16px;">Please prepare the item for delivery</p>
        </div>
    `;
};

/**
 * Buyer Order Confirmation Template
 */
export const buyerOrderConfirmationTemplate = ({ booking, item, buyer, bookingType, fullAddress, rentalDays }) => {
  const isRental = bookingType === 'Rental';
  const deliveryTimeline = isRental
    ? 'Values delivered 1 day before rental start date'
    : 'Delivered in 2–7 business days';

  return `
        ${header}
        <div style="background: linear-gradient(135deg, #fff 0%, #fff1f2 100%); border: 2px solid #800000; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #800000; margin-top: 0; text-align: center;">Order Confirmed! 🛍️</h2>
            <p style="color: #666; font-size: 16px; text-align: center;">Thank you for choosing Vastra Vows.</p>
            <p style="text-align: center; margin-top: 10px; font-weight: bold;">Order ID: #${booking._id}</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #eee;">
            <h3 style="color: #800000; margin-top: 0; border-bottom: 2px solid #fce7f3; padding-bottom: 10px;">Item Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px 0; color: #555;"><strong>Item:</strong></td>
                    <td style="padding: 10px 0; text-align: right;">${item.title}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #555;"><strong>Type:</strong></td>
                    <td style="padding: 10px 0; text-align: right;">${bookingType}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #555;"><strong>Size:</strong></td>
                    <td style="padding: 10px 0; text-align: right;">${booking.size || 'N/A'}</td>
                </tr>
                 ${isRental ? `
                <tr>
                    <td style="padding: 10px 0; color: #555;"><strong>Rental Period:</strong></td>
                    <td style="padding: 10px 0; text-align: right;">
                        ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}<br>
                        <span style="font-size: 12px; color: #888;">(${rentalDays} days)</span>
                    </td>
                </tr>
                ` : ''}
            </table>
        </div>

        <div style="background: #fafafa; border-radius: 12px; padding: 25px; margin-bottom: 20px; border: 1px solid #eee;">
            <h3 style="color: #800000; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Price Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666;">Base Price (${isRental ? 'Rent' : 'Sale'}):</td>
                    <td style="padding: 8px 0; text-align: right;">₹${isRental ? booking.rentAmount : (item.salePrice || 0)}</td>
                </tr>
                ${isRental ? `
                <tr>
                    <td style="padding: 8px 0; color: #666;">Security Deposit:</td>
                    <td style="padding: 8px 0; text-align: right;">₹${booking.depositAmount || 0}</td>
                </tr>` : ''}
                <tr>
                    <td style="padding: 8px 0; color: #666;">Platform Fee:</td>
                    <td style="padding: 8px 0; text-align: right;">₹${booking.platformFee || 0}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Delivery Charges:</td>
                    <td style="padding: 8px 0; text-align: right;">₹${booking.deliveryCharges || 0}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">GST:</td>
                    <td style="padding: 8px 0; text-align: right;">₹${booking.gst || 0}</td>
                </tr>
                <tr style="border-top: 1px dashed #ccc; font-weight: bold; font-size: 18px;">
                    <td style="padding: 15px 0 0 0; color: #000;">Total Paid:</td>
                    <td style="padding: 15px 0 0 0; text-align: right; color: #059669;">₹${booking.totalAmount}</td>
                </tr>
            </table>
        </div>

        <div style="background: #fffbe6; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #b45309; margin-top: 0;">🚚 Delivery Information</h3>
            <p style="margin: 8px 0;"><strong>Estimated Timeline:</strong> ${deliveryTimeline}</p>
            <p style="margin: 8px 0; font-size: 14px; color: #555;">${fullAddress}</p>
        </div>

        ${footer}
    `;
};

/**
 * Owner Order Notification Template
 */
export const ownerOrderNotificationTemplate = ({ booking, item, buyer, bookingType, fullAddress, locationLink, rentalDays }) => {
  return `
        ${header}
        <div style="background: linear-gradient(135deg, #fff 0%, #f0fdf4 100%); border: 2px solid #166534; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #166534; margin-top: 0;">🌟 New Order Received!</h2>
            <p style="color: #666;">Great news! Your item <strong>${item.title}</strong> has been rented/sold.</p>
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1; background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
                <h3 style="color: #800000; margin-top: 0; font-size: 16px;">Order Details</h3>
                <p style="font-size: 14px; margin: 5px 0;"><strong>ID:</strong> ${booking._id}</p>
                <p style="font-size: 14px; margin: 5px 0;"><strong>Type:</strong> ${bookingType}</p>
                <p style="font-size: 14px; margin: 5px 0;"><strong>Payout Amount:</strong> ₹${booking.rentAmount || item.salePrice}</p>
            </div>
             <div style="flex: 1; background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
                <h3 style="color: #800000; margin-top: 0; font-size: 16px;">Buyer Info</h3>
                <p style="font-size: 14px; margin: 5px 0;"><strong>Name:</strong> ${buyer.name}</p>
                <p style="font-size: 14px; margin: 5px 0;"><strong>Phone:</strong> ${buyer.phone || 'N/A'}</p>
                 <p style="font-size: 14px; margin: 5px 0;"><strong>Email:</strong> ${buyer.email}</p>
            </div>
        </div>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">📍 Delivery Location</h3>
            <p style="margin-bottom: 15px; color: #333;">${fullAddress}</p>
            
            ${locationLink ? `
            <div style="text-align: center;">
                <a href="${locationLink}" target="_blank" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    🗺️ View on Google Maps
                </a>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">Click above to navigate to the buyer's location.</p>
            </div>
            ` : '<p style="color: #666; font-style: italic;">No map location provided.</p>'}
        </div>

        ${bookingType === 'Rental' ? `
        <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #9a3412; margin-top: 0;">📅 Schedule</h3>
             <p style="margin: 8px 0;"><strong>Delivery:</strong> 1 day before ${new Date(booking.startDate).toLocaleDateString()}</p>
             <p style="margin: 8px 0;"><strong>Pickup/Return:</strong> 1 day after ${new Date(booking.endDate).toLocaleDateString()}</p>
        </div>
        ` : ''}

        ${footer}
    `;
};
