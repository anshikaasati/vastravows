import pkg from 'nodemailer';
const { createTransport } = pkg;
import User from '../models/User.js';

// Twilio WhatsApp client (optional - only if credentials are provided)
let twilioClient = null;
let twilioInitialized = false;

const initializeTwilio = async () => {
    if (twilioInitialized) return twilioClient;
    
    try {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            const twilio = await import('twilio');
            twilioClient = twilio.default(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            twilioInitialized = true;
            return twilioClient;
        }
    } catch (error) {
        console.log('Twilio not configured - WhatsApp notifications disabled');
    }
    twilioInitialized = true;
    return null;
};

// Create email transporter
const createEmailTransporter = () => {
    return createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'vastravows@gmail.com',
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Get all active users for admin notification
const getAllActiveUsers = async () => {
    const users = await User.find({ isDeleted: { $ne: true } })
        .select('name email phone roles createdAt isLenderEnabled')
        .sort({ createdAt: -1 });
    return users;
};

// Generate user list HTML table
const generateUserListTable = (users) => {
    const rows = users.map(user => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-align: left;">${user.name}</td>
            <td style="padding: 12px; text-align: left;">${user.email}</td>
            <td style="padding: 12px; text-align: left;">${user.phone || 'N/A'}</td>
            <td style="padding: 12px; text-align: left;">${user.roles.join(', ')}</td>
            <td style="padding: 12px; text-align: left;">${new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');

    return `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
                <tr style="background: #800000; color: white;">
                    <th style="padding: 12px; text-align: left;">Name</th>
                    <th style="padding: 12px; text-align: left;">Email</th>
                    <th style="padding: 12px; text-align: left;">Phone</th>
                    <th style="padding: 12px; text-align: left;">Roles</th>
                    <th style="padding: 12px; text-align: left;">Registered</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
};

// WhatsApp notification helper
const sendWhatsAppMessage = async (to, message) => {
    const client = await initializeTwilio();
    if (!client || !process.env.TWILIO_WHATSAPP_NUMBER) {
        console.log('WhatsApp not configured - skipping WhatsApp notification');
        return;
    }

    try {
        await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${to}`,
            body: message
        });
        console.log(`WhatsApp message sent to ${to}`);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
};

// 1. Send user registration notification to admin
export const sendUserRegistrationNotification = async (newUser) => {
    try {
        const transporter = createEmailTransporter();
        const allUsers = await getAllActiveUsers();
        const userListTable = generateUserListTable(allUsers);

        const mailOptions = {
            from: process.env.EMAIL_USER || 'vastravows@gmail.com',
            to: process.env.ADMIN_EMAIL || 'vastravows@gmail.com',
            subject: '🎉 New User Registration - Vastra Vows',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9fafb;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #800000; font-family: 'Playfair Display', serif; margin: 0;">Vastra Vows</h1>
                        <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Admin Notification</p>
                    </div>

                    <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #800000; margin-top: 0;">🎉 New User Registered</h2>
                        
                        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #059669; margin-top: 0;">New User Details</h3>
                            <p style="margin: 8px 0;"><strong>Name:</strong> ${newUser.name}</p>
                            <p style="margin: 8px 0;"><strong>Email:</strong> ${newUser.email}</p>
                            <p style="margin: 8px 0;"><strong>Phone:</strong> ${newUser.phone || 'Not provided'}</p>
                            <p style="margin: 8px 0;"><strong>Registered:</strong> ${new Date(newUser.createdAt).toLocaleString()}</p>
                            <p style="margin: 8px 0;"><strong>Roles:</strong> ${newUser.roles?.join(', ') || 'buyer'}</p>
                        </div>

                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #92400e;"><strong>Total Active Users:</strong> ${allUsers.length}</p>
                        </div>
                    </div>

                    <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="color: #800000;">All Active Users (${allUsers.length})</h3>
                        ${userListTable}
                    </div>

                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 12px; margin: 5px 0;">
                            © ${new Date().getFullYear()} Vastra Vows. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('User registration email sent to admin');

        // Send WhatsApp notification
        const adminWhatsApp = process.env.ADMIN_WHATSAPP;
        if (adminWhatsApp) {
            const whatsappMessage = `🎉 New User Registered - Vastra Vows

Name: ${newUser.name}
Email: ${newUser.email}
Phone: ${newUser.phone || 'Not provided'}
Total Active Users: ${allUsers.length}

View full details in your email.`;
            await sendWhatsAppMessage(adminWhatsApp, whatsappMessage);
        }
    } catch (error) {
        console.error('Error sending user registration notification:', error);
    }
};

// 2. Send user deletion notification to admin
export const sendUserDeletionNotification = async (deletedUser) => {
    try {
        const transporter = createEmailTransporter();
        const allUsers = await getAllActiveUsers();
        const userListTable = generateUserListTable(allUsers);

        const mailOptions = {
            from: process.env.EMAIL_USER || 'vastravows@gmail.com',
            to: process.env.ADMIN_EMAIL || 'vastravows@gmail.com',
            subject: '🗑️ User Account Deleted - Vastra Vows',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9fafb;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #800000; font-family: 'Playfair Display', serif; margin: 0;">Vastra Vows</h1>
                        <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Admin Notification</p>
                    </div>

                    <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #800000; margin-top: 0;">🗑️ User Account Deleted</h2>
                        
                        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #dc2626; margin-top: 0;">Deleted User Details</h3>
                            <p style="margin: 8px 0;"><strong>Name:</strong> ${deletedUser.name}</p>
                            <p style="margin: 8px 0;"><strong>Email:</strong> ${deletedUser.email}</p>
                            <p style="margin: 8px 0;"><strong>Phone:</strong> ${deletedUser.phone || 'Not provided'}</p>
                            <p style="margin: 8px 0;"><strong>Deleted At:</strong> ${new Date().toLocaleString()}</p>
                            <p style="margin: 8px 0;"><strong>Was Member Since:</strong> ${new Date(deletedUser.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #92400e;"><strong>Remaining Active Users:</strong> ${allUsers.length}</p>
                        </div>
                    </div>

                    <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="color: #800000;">Remaining Active Users (${allUsers.length})</h3>
                        ${userListTable}
                    </div>

                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 12px; margin: 5px 0;">
                            © ${new Date().getFullYear()} Vastra Vows. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('User deletion email sent to admin');

        // Send WhatsApp notification
        const adminWhatsApp = process.env.ADMIN_WHATSAPP;
        if (adminWhatsApp) {
            const whatsappMessage = `🗑️ User Account Deleted - Vastra Vows

Name: ${deletedUser.name}
Email: ${deletedUser.email}
Phone: ${deletedUser.phone || 'Not provided'}
Remaining Active Users: ${allUsers.length}

View full details in your email.`;
            await sendWhatsAppMessage(adminWhatsApp, whatsappMessage);
        }
    } catch (error) {
        console.error('Error sending user deletion notification:', error);
    }
};

// 3. Send booking notification to lender and admin
export const sendBookingNotification = async (booking, item, buyer, lender) => {
    try {
        const transporter = createEmailTransporter();

        const isRental = item.rentPricePerDay > 0;
        const bookingType = isRental ? 'Rental' : 'Purchase';

        // Calculate rental days if it's a rental
        let rentalDays = 0;
        if (isRental && booking.startDate && booking.endDate) {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        }

        // Format delivery address
        const deliveryAddress = booking.deliveryAddress || '';
        const city = booking.location?.city || '';
        const pincode = booking.location?.pincode || '';
        const fullAddress = `${deliveryAddress}${city ? ', ' + city : ''}${pincode ? ' - ' + pincode : ''}`.trim();

        const emailHTML = `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9fafb;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #800000; font-family: 'Playfair Display', serif; margin: 0;">Vastra Vows</h1>
                    <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">New Booking Notification</p>
                </div>

                <div style="background: linear-gradient(135deg, #fff 0%, #fff1f2 100%); border: 2px solid #800000; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
                    <h2 style="color: #800000; margin-top: 0;">📦 New ${bookingType} Booking Received!</h2>
                    <p style="color: #666; font-size: 14px;">Booking ID: <strong>${booking._id}</strong></p>
                </div>

                <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: #800000; margin-top: 0;">Item Details</h3>
                    ${item.images && item.images[0] ? `<img src="${item.images[0]}" alt="${item.title}" style="max-width: 300px; width: 100%; border-radius: 10px; margin: 15px 0;">` : ''}
                    <p style="margin: 8px 0;"><strong>Item Name:</strong> ${item.title}</p>
                    <p style="margin: 8px 0;"><strong>Category:</strong> ${item.gender} - ${item.subcategory}</p>
                    <p style="margin: 8px 0;"><strong>Size:</strong> ${booking.size || 'N/A'}</p>
                    ${isRental ? `<p style="margin: 8px 0;"><strong>Rental Price:</strong> ₹${item.rentPricePerDay}/day</p>` : `<p style="margin: 8px 0;"><strong>Sale Price:</strong> ₹${item.salePrice || 0}</p>`}
                </div>

                <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #1e40af; margin-top: 0;">👤 Buyer Information</h3>
                    <p style="margin: 8px 0;"><strong>Name:</strong> ${buyer.name || booking.renterName || 'N/A'}</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${buyer.email}" style="color: #3b82f6;">${buyer.email || 'N/A'}</a></p>
                    <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${buyer.phone || booking.phoneNumber}" style="color: #3b82f6;">${buyer.phone || booking.phoneNumber || 'Not provided'}</a></p>
                    <p style="margin: 8px 0;"><strong>Delivery Address:</strong><br>${fullAddress || 'Not provided'}</p>
                </div>

                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #059669; margin-top: 0;">📅 Booking Details</h3>
                    ${isRental ? `
                        <p style="margin: 8px 0;"><strong>Rental Period:</strong> ${rentalDays} days</p>
                        <p style="margin: 8px 0;"><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
                        <p style="margin: 8px 0;"><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
                        <p style="margin: 8px 0;"><strong>Rent Amount:</strong> ₹${booking.rentAmount || 0}</p>
                        <p style="margin: 8px 0;"><strong>Security Deposit:</strong> ₹${booking.depositAmount || item.depositAmount || 0}</p>
                    ` : ''}
                    ${booking.platformFee > 0 ? `<p style="margin: 8px 0;"><strong>Platform Fee:</strong> ₹${booking.platformFee}</p>` : ''}
                    ${booking.deliveryCharges > 0 ? `<p style="margin: 8px 0;"><strong>Delivery Charges:</strong> ₹${booking.deliveryCharges}</p>` : ''}
                    ${booking.gst > 0 ? `<p style="margin: 8px 0;"><strong>GST:</strong> ₹${booking.gst}</p>` : ''}
                    <p style="margin: 8px 0;"><strong>Total Amount:</strong> <span style="font-size: 20px; color: #059669;">₹${booking.totalAmount || 0}</span></p>
                    ${booking.paidAmount > 0 ? `<p style="margin: 8px 0;"><strong>Paid Amount:</strong> ₹${booking.paidAmount}</p>` : ''}
                    ${booking.dueAmount > 0 ? `<p style="margin: 8px 0;"><strong>Due Amount:</strong> ₹${booking.dueAmount}</p>` : ''}
                    <p style="margin: 8px 0;"><strong>Payment Method:</strong> ${booking.paymentMethod === 'online' ? 'Online Payment' : booking.paymentMethod === 'cod' ? 'Cash on Delivery' : booking.paymentMethod || 'N/A'}</p>
                    <p style="margin: 8px 0;"><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleString()}</p>
                </div>

                <div style="background: #800000; color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px 0;">⚡ Action Required</h3>
                    <p style="margin: 0; font-size: 16px;">Please prepare the item for delivery</p>
                </div>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #999; font-size: 12px; margin: 5px 0;">
                        © ${new Date().getFullYear()} Vastra Vows. All rights reserved.
                    </p>
                    <p style="color: #999; font-size: 11px; margin: 5px 0;">
                        For any queries, contact us at vastravows@gmail.com
                    </p>
                </div>
            </div>
        `;

        // Send to lender
        if (lender && lender.email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'vastravows@gmail.com',
                to: lender.email,
                subject: `📦 New ${bookingType} Booking - ${item.title}`,
                html: emailHTML
            });
            console.log('Booking email sent to lender');

            // Send WhatsApp to lender
            if (lender.phone) {
                const lenderWhatsappMessage = `📦 New Booking Received!

Item: ${item.title}
Amount: ₹${booking.totalAmount || 0}
Buyer: ${buyer.name || booking.renterName || 'N/A'}
Phone: ${buyer.phone || booking.phoneNumber || 'N/A'}
Delivery: ${fullAddress || 'Not provided'}

Check your email for complete details.`;
                await sendWhatsAppMessage(lender.phone, lenderWhatsappMessage);
            }
        }

        // Send to admin
        const adminEmail = process.env.ADMIN_EMAIL || 'vastravows@gmail.com';
        await transporter.sendMail({
            from: process.env.EMAIL_USER || 'vastravows@gmail.com',
            to: adminEmail,
            subject: `📦 New ${bookingType} Booking - ${item.title} (Admin Copy)`,
            html: emailHTML
        });
        console.log('Booking email sent to admin');

        // Send WhatsApp to admin
        const adminWhatsApp = process.env.ADMIN_WHATSAPP;
        if (adminWhatsApp) {
            const adminWhatsappMessage = `📦 New Booking Received!

Item: ${item.title}
Amount: ₹${booking.totalAmount || 0}
Buyer: ${buyer.name || booking.renterName || 'N/A'}
Phone: ${buyer.phone || booking.phoneNumber || 'N/A'}
Delivery: ${fullAddress || 'Not provided'}

Check your email for complete details.`;
            await sendWhatsAppMessage(adminWhatsApp, adminWhatsappMessage);
        }
    } catch (error) {
        console.error('Error sending booking notification:', error);
    }
};
