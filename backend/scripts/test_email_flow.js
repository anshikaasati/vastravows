import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendBookingNotification } from '../utils/notificationService.js';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const mockBooking = {
    _id: 'ORDER123456',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    totalAmount: 5000,
    rentAmount: 4500,
    depositAmount: 500,
    platformFee: 0,
    deliveryCharges: 0,
    gst: 0,
    deliveryAddress: '123 Test St, Tech Park',
    location: {
        city: 'Bangalore',
        pincode: '560100',
        latitude: 12.9716,
        longitude: 77.5946
    },
    size: 'M'
};

const mockItem = {
    title: 'Designer Lehenga',
    rentPricePerDay: 1500,
    salePrice: 0 // Rental item
};

const mockBuyer = {
    name: 'Test Buyer',
    email: 'recipient@example.com', // Will be logged or sent if creds valid
    phone: '9876543210'
};

const mockLender = {
    name: 'Test Owner',
    email: 'owner@example.com',
    phone: '9123456789'
};

console.log('--- Starting Email Test ---');
console.log('Mock Booking ID:', mockBooking._id);

sendBookingNotification(mockBooking, mockItem, mockBuyer, mockLender)
    .then(() => console.log('--- Test Completed (Check logs above) ---'))
    .catch(err => console.error('--- Test Failed ---', err));
