import { sendEmail } from '../services/emailService.js';
import {
    newUserNotificationTemplate,
    userDeletedNotificationTemplate,
    bookingNotificationTemplate
} from '../templates/emailTemplates.js';
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

// Get all active users for admin notification
const getAllActiveUsers = async () => {
    const users = await User.find({ isDeleted: { $ne: true } })
        .select('name email phone roles createdAt isLenderEnabled')
        .sort({ createdAt: -1 });
    return users;
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
        const allUsers = await getAllActiveUsers();

        const htmlContent = newUserNotificationTemplate({
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            totalUsers: allUsers.length
        });

        await sendEmail({
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'vastravows@gmail.com',
            subject: '🎉 New User Registration - Vastra Vows',
            html: htmlContent
        });

        // WhatsApp Notification
        const adminWhatsApp = process.env.ADMIN_WHATSAPP;
        if (adminWhatsApp) {
            const whatsappMessage = `🎉 New User Registered - Vastra Vows\n\nName: ${newUser.name}\nEmail: ${newUser.email}\nPhone: ${newUser.phone || 'Not provided'}\nTotal Active Users: ${allUsers.length}\n\nView full details in your email.`;
            await sendWhatsAppMessage(adminWhatsApp, whatsappMessage);
        }
    } catch (error) {
        console.error('Error sending user registration notification:', error);
    }
};

// 2. Send user deletion notification to admin
export const sendUserDeletionNotification = async (deletedUser) => {
    try {
        const allUsers = await getAllActiveUsers();

        const htmlContent = userDeletedNotificationTemplate({
            name: deletedUser.name,
            email: deletedUser.email,
            phone: deletedUser.phone,
            totalUsers: allUsers.length
        });

        await sendEmail({
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'vastravows@gmail.com',
            subject: '🗑️ User Account Deleted - Vastra Vows',
            html: htmlContent
        });

        // WhatsApp Notification
        const adminWhatsApp = process.env.ADMIN_WHATSAPP;
        if (adminWhatsApp) {
            const whatsappMessage = `🗑️ User Account Deleted - Vastra Vows\n\nName: ${deletedUser.name}\nEmail: ${deletedUser.email}\nPhone: ${deletedUser.phone || 'Not provided'}\nRemaining Active Users: ${allUsers.length}\n\nView full details in your email.`;
            await sendWhatsAppMessage(adminWhatsApp, whatsappMessage);
        }
    } catch (error) {
        console.error('Error sending user deletion notification:', error);
    }
};

// 3. Send booking notification to lender and admin
export const sendBookingNotification = async (booking, item, buyer, lender) => {
    try {
        const isRental = item.rentPricePerDay > 0;
        const bookingType = isRental ? 'Rental' : 'Purchase';

        // Calculate rental days
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

        const htmlContent = bookingNotificationTemplate({
            booking,
            item,
            buyer,
            bookingType,
            fullAddress,
            rentalDays
        });

        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'vastravows@gmail.com';

        // Send to Lender
        if (lender && lender.email) {
            await sendEmail({
                to: lender.email,
                subject: `📦 New ${bookingType} Booking - ${item.title}`,
                html: htmlContent
            });

            // Send WhatsApp to lender
            if (lender.phone) {
                const lenderWhatsappMessage = `📦 New Booking Received!\n\nItem: ${item.title}\nAmount: ₹${booking.totalAmount || 0}\nBuyer: ${buyer.name || booking.renterName || 'N/A'}\nPhone: ${buyer.phone || booking.phoneNumber || 'N/A'}\nDelivery: ${fullAddress || 'Not provided'}\n\nCheck your email for complete details.`;
                await sendWhatsAppMessage(lender.phone, lenderWhatsappMessage);
            }
        }

        // Send to Admin
        await sendEmail({
            to: adminEmail,
            subject: `📦 New ${bookingType} Booking - ${item.title} (Admin Copy)`,
            html: htmlContent
        });

        // Send WhatsApp to Admin
        const adminWhatsApp = process.env.ADMIN_WHATSAPP;
        if (adminWhatsApp) {
            const adminWhatsappMessage = `📦 New Booking Received!\n\nItem: ${item.title}\nAmount: ₹${booking.totalAmount || 0}\nBuyer: ${buyer.name || booking.renterName || 'N/A'}\nPhone: ${buyer.phone || booking.phoneNumber || 'N/A'}\nDelivery: ${fullAddress || 'Not provided'}\n\nCheck your email for complete details.`;
            await sendWhatsAppMessage(adminWhatsApp, adminWhatsappMessage);
        }

    } catch (error) {
        console.error('Error sending booking notification:', error);
    }
};
