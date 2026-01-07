import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Booking from '../models/Booking.js';

// Lazy initialization to ensure env vars are loaded
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// 1. Save Lender Payment Info (Text-based, no Razorpay integration)
export const onboardLender = async (req, res) => {
    try {
        const { upiId, bankAccountNumber, bankIfscCode, bankAccountHolderName } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Simply save payment details as text
        if (upiId) user.upiId = upiId;
        if (bankAccountNumber) user.bankAccountNumber = bankAccountNumber;
        if (bankIfscCode) user.bankIfscCode = bankIfscCode;
        if (bankAccountHolderName) user.bankAccountHolderName = bankAccountHolderName;

        await user.save();

        res.json({
            message: 'Payment details saved successfully',
            user: {
                upiId: user.upiId,
                bankAccountNumber: user.bankAccountNumber,
                bankIfscCode: user.bankIfscCode,
                bankAccountHolderName: user.bankAccountHolderName
            }
        });
    } catch (error) {
        console.error('Save Payment Details Error:', error);
        res.status(500).json({ message: 'Failed to save payment details', error: error.message });
    }
};

// 2. Create Booking Order
export const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;
        const razorpay = getRazorpayInstance();
        const options = {
            amount: amount * 100, // amount in paisa
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1 // Auto capture
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
};

// 3. Verify Payment & Create Booking (Manual payment processing)
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingData
        } = req.body;

        // Verify Signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        // Fetch Item to get ownerId
        const item = await Item.findById(bookingData.itemId).populate('ownerId');
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Calculate totalAmount if missing
        const totalAmount = bookingData.totalAmount || (bookingData.paidAmount + bookingData.dueAmount);

        // Create Booking
        const status = bookingData.dueAmount > 0 ? 'partially_paid' : 'confirmed';

        const booking = await Booking.create({
            ...bookingData,
            renterId: req.user._id,
            ownerId: item.ownerId._id, // Securely get ownerId from DB
            totalAmount: totalAmount,  // Ensure totalAmount is present
            status: status,
            paymentStatus: bookingData.dueAmount > 0 ? 'partial' : 'paid',
            transactionId: razorpay_payment_id
        });

        // Log booking for manual payment processing by owner
        if (item.ownerId) {
            console.log(`Booking confirmed: ${booking._id}`);
            console.log(`Lender UPI: ${item.ownerId.upiId || 'Not provided'}`);
            console.log(`Rent Amount: ₹${bookingData.rentAmount || 0}`);
            console.log(`Owner will process payment manually to lender`);
        }

        res.json({ message: 'Payment verified and booking confirmed', bookingId: booking._id });
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
};

// 4. Create Subscription (for Lender Monthly Fee)
export const createSubscription = async (req, res) => {
    try {
        const razorpay = getRazorpayInstance();

        // Plan ID should be in env
        const planId = process.env.RAZORPAY_PLAN_ID;
        if (!planId) return res.status(500).json({ message: 'Subscription Plan ID not configured' });

        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: 120, // 10 years
            quantity: 1,
            customer_notify: 1,
            notes: {
                userId: req.user._id.toString(),
                userEmail: req.user.email
            }
        });

        res.json(subscription);
    } catch (error) {
        console.error('Subscription Creation Error:', error);
        res.status(500).json({ message: 'Failed to create subscription', error: error.message });
    }
};

// 5. Verify Subscription
export const verifySubscription = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
            itemId,
            userId
        } = req.body;

        const body = razorpay_payment_id + '|' + razorpay_subscription_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        // If itemId is provided, activate Item (old flow)
        if (itemId) {
            const item = await Item.findById(itemId);
            if (item) {
                item.razorpaySubscriptionId = razorpay_subscription_id;
                item.subscriptionStatus = 'active';
                item.isActive = true;
                await item.save();
            }
        }

        // If userId is provided, activate User subscription (new flow)
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                user.razorpaySubscriptionId = razorpay_subscription_id;
                user.subscriptionStatus = 'active';
                await user.save();
            }
        }

        res.json({ message: 'Subscription verified and activated' });
    } catch (error) {
        res.status(500).json({ message: 'Subscription verification failed', error: error.message });
    }
};

// 6. Webhook Handler
export const handleWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSignature !== signature) {
        return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    try {
        if (event === 'subscription.charged') {
            const subId = payload.subscription.entity.id;
            // Update both User and Item subscriptions
            await User.findOneAndUpdate(
                { razorpaySubscriptionId: subId },
                { subscriptionStatus: 'active' }
            );
            await Item.findOneAndUpdate(
                { razorpaySubscriptionId: subId },
                { subscriptionStatus: 'active', isActive: true }
            );
        } else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
            const subId = payload.subscription.entity.id;
            await User.findOneAndUpdate(
                { razorpaySubscriptionId: subId },
                { subscriptionStatus: 'cancelled' }
            );
            await Item.findOneAndUpdate(
                { razorpaySubscriptionId: subId },
                { subscriptionStatus: 'cancelled', isActive: false }
            );
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};
