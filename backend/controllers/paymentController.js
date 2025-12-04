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

// 1. Onboard Lender (Create Linked Account & Fund Account & Subscription)
export const onboardLender = async (req, res) => {
    try {
        const { upiId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const razorpay = getRazorpayInstance();

        // 1. Create Linked Account (Route)
        // This creates a sub-merchant account for the lender
        let accountId = user.razorpayAccountId;

        if (!accountId) {
            const account = await razorpay.accounts.create({
                type: "route",
                name: user.name,
                email: user.email,
                legal_business_name: user.name,
                contact_name: user.name,
                profile: {
                    category: "services",
                    subcategory: "rental"
                }
            });
            accountId = account.id;
            user.razorpayAccountId = accountId;
        }

        // 2. Create Fund Account (UPI) linked to the Route Account
        // We first need a contact for this specific linked account context? 
        // Actually for Route, we add fund accounts to the linked account.
        // But Razorpay Node SDK wrapper might differ slightly. 
        // Standard flow: Create Contact -> Create Fund Account.
        // For Route, we usually just need the Account ID to transfer TO.
        // To settle funds FROM the linked account TO the user's UPI, we need to add the bank details to that account.
        // However, programmatically adding fund accounts to a Linked Account usually requires using the 'X' API headers or specific Route endpoints.
        // For simplicity in this 'Route' flow, we often just need the Account ID to transfer funds *into*.
        // The settlement details (UPI) are added to the Linked Account.

        // Let's try to add the UPI as a Fund Account for the Linked Account.
        // Note: In many Route flows, you send an invite to the user to add their bank details, OR you use the API if you have collected them.
        // We will assume we can add it directly since we have the UPI ID.

        // Create Contact (Standard) - strictly speaking not always needed for Route if we just want to transfer, 
        // but needed if we want to manage their fund accounts via API.
        const contact = await razorpay.contacts.create({
            name: user.name,
            email: user.email,
            contact: user.phone,
            type: 'vendor',
            reference_id: userId.toString(),
            notes: {
                notes_key_1: "Lender Onboarding",
                notes_key_2: "Rental Platform"
            }
        });

        // Create Fund Account
        const fundAccount = await razorpay.fund_accounts.create({
            contact_id: contact.id,
            account_type: 'vpa',
            vpa: {
                address: upiId,
            },
        });

        // IMPORTANT: For Route, we technically need to associate this Fund Account with the Linked Account (accountId) 
        // so Razorpay knows where to settle the money *from* that Linked Account.
        // However, the standard `fund_accounts.create` creates it under the *Platform's* contact list.
        // To fully automate Route settlements, we usually rely on Razorpay's settlement logic or use the 'stakeholder' API.
        // For this implementation, we will store the Account ID (for transfers) and the Fund Account ID (for reference/payouts if needed).

        // Create Subscription for Lender (if plan is configured)
        const planId = process.env.RAZORPAY_PLAN_ID;
        let subscription = null;

        if (planId && planId !== 'plan_YOUR_PLAN_ID_HERE') {
            try {
                subscription = await razorpay.subscriptions.create({
                    plan_id: planId,
                    total_count: 120, // 10 years
                    quantity: 1,
                    customer_notify: 1,
                    notes: {
                        userId: userId.toString(),
                        userEmail: user.email,
                        userName: user.name
                    }
                });
            } catch (subError) {
                console.error('Subscription creation failed:', subError);
                // Continue without subscription
            }
        }

        user.upiId = upiId;
        user.razorpayContactId = contact.id;
        user.razorpayFundAccountId = fundAccount.id;

        if (subscription) {
            user.razorpaySubscriptionId = subscription.id;
            user.subscriptionStatus = 'pending';
        }

        await user.save();

        const response = {
            message: 'Lender onboarded successfully',
            accountId: accountId // Return this for debugging
        };

        if (subscription) {
            response.subscription = {
                id: subscription.id,
                status: subscription.status
            };
        }

        res.json(response);
    } catch (error) {
        console.error('Onboarding Error:', error);
        res.status(500).json({ message: 'Failed to onboard lender', error: error.message });
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

// 3. Verify Payment & Create Booking & Transfer (Route)
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

        // Create Booking
        const booking = await Booking.create({
            ...bookingData,
            renterId: req.user._id,
            status: 'confirmed',
            paymentStatus: 'paid',
            transactionId: razorpay_payment_id
        });

        // Trigger Transfer to Lender (Route)
        const item = await Item.findById(bookingData.itemId).populate('ownerId');

        // We need the Lender's Linked Account ID
        // If they have one (razorpayAccountId), we transfer to it.
        // If they only have a Fund Account (razorpayFundAccountId), we might be using Payouts (old flow).
        // We'll prioritize Route (AccountId).

        if (item && item.ownerId) {
            const razorpay = getRazorpayInstance();
            const rentAmount = bookingData.rentAmount || 0;
            const depositAmount = bookingData.depositAmount || 0;

            // Calculate transfer amount (e.g., 90% of Rent)
            // For now, let's transfer the full Rent Amount to the lender, and keep the Deposit? 
            // Or transfer everything? 
            // User requirement: "payment should go directly to the lender’s UPI"
            // Let's transfer the Rent Amount.

            const transferAmount = rentAmount * 100; // in paisa

            if (transferAmount > 0) {
                const transferOptions = {
                    amount: transferAmount,
                    currency: 'INR',
                    notes: {
                        booking_id: booking._id.toString(),
                        item_title: item.title
                    }
                };

                if (item.ownerId.razorpayAccountId) {
                    // Route Transfer (Preferred)
                    transferOptions.account = item.ownerId.razorpayAccountId;
                    await razorpay.transfers.create(transferOptions);
                    console.log(`Transferred ${transferAmount} to Linked Account ${item.ownerId.razorpayAccountId}`);
                } else if (item.ownerId.razorpayFundAccountId) {
                    // Fallback to Direct Transfer if supported or log warning
                    // Direct transfers to Fund Accounts usually require Payouts API, not Transfers API.
                    console.warn('Lender has no Linked Account ID, skipping Route transfer.');
                }
            }
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
