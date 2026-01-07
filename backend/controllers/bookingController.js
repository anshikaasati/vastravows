import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import { sendBookingNotification } from '../utils/notificationService.js';

const findOverlappingBookings = async ({ itemId, startDate, endDate }) => {
  return Booking.find({
    itemId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });
};

const computeTotal = (item, startDate, endDate) => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const days = Math.max(1, Math.ceil((endDate - startDate) / millisecondsPerDay));
  return days * item.rentPricePerDay + (item.depositAmount || 0);
};

export const checkAvailability = async (req, res, next) => {
  try {
    const { itemId, startDate, endDate } = req.body;
    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    if (parsedStart > parsedEnd) {
      res.status(400);
      return next(new Error('Start date must be before end date'));
    }

    const conflicts = await findOverlappingBookings({ itemId, startDate: parsedStart, endDate: parsedEnd });
    if (conflicts.length) {
      return res.json({ available: false, conflictingBookings: conflicts });
    }
    return res.json({ available: true });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const {
      itemId, startDate, endDate,
      renterName, phoneNumber, size,
      deliveryAddress, pickupAddress, location,
      paymentMethod, depositPaymentMethod, rentPaymentMethod,
      // New fields from frontend
      platformFee = 0,
      deliveryCharges = 0,
      gst = 0,
      paidAmount = 0,
      dueAmount = 0
    } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    let parsedStart, parsedEnd;

    // Rental Logic: Require dates and check overlaps
    if (item.rentPricePerDay > 0) {
      if (!startDate || !endDate) {
        res.status(400);
        return next(new Error('Start and End dates are required for rentals'));
      }
      parsedStart = new Date(startDate);
      parsedEnd = new Date(endDate);

      const conflicts = await findOverlappingBookings({ itemId, startDate: parsedStart, endDate: parsedEnd });
      if (conflicts.length) {
        res.status(400);
        return next(new Error('Selected dates overlap with existing booking'));
      }
    } else {
      // Sale Logic: Default to now if dates missing
      parsedStart = startDate ? new Date(startDate) : new Date();
      parsedEnd = endDate ? new Date(endDate) : new Date();
    }

    let rentAmount = 0;
    let depositAmount = 0;
    let itemTotal = 0;

    if (item.rentPricePerDay > 0) {
      // Rental
      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      const days = Math.max(1, Math.ceil((parsedEnd - parsedStart) / millisecondsPerDay));
      rentAmount = days * item.rentPricePerDay;
      depositAmount = item.depositAmount || 0;
      itemTotal = rentAmount + depositAmount;
    } else {
      // Sale
      itemTotal = item.salePrice || 0;
    }

    // Total amount for this specific booking record
    // If platformFee/deliveryCharges are passed (e.g. on the first item of an order), add them
    const totalAmount = itemTotal + platformFee + deliveryCharges + gst;

    const booking = await Booking.create({
      itemId,
      renterId: req.user._id,
      ownerId: item.ownerId,
      startDate: parsedStart,
      endDate: parsedEnd,
      totalAmount,
      rentAmount,
      depositAmount,
      platformFee,
      deliveryCharges,
      gst,
      paidAmount,
      dueAmount,
      renterName,
      phoneNumber,
      size,
      deliveryAddress,
      pickupAddress,
      location,
      paymentMethod,
      depositPaymentMethod,
      rentPaymentMethod,
      status: dueAmount > 0 ? 'partially_paid' : 'confirmed'
    });

    const populated = await booking.populate('itemId renterId ownerId', 'title name email phone images');

    // Send notifications to lender and admin (non-blocking)
    try {
      const buyer = await User.findById(req.user._id).select('name email phone');
      const lender = await User.findById(item.ownerId).select('name email phone');

      if (buyer && lender && populated.itemId) {
        sendBookingNotification(
          populated.toObject(),
          populated.itemId.toObject(),
          buyer.toObject(),
          lender.toObject()
        ).catch(err =>
          console.error('Failed to send booking notification:', err)
        );
      }
    } catch (notifError) {
      console.error('Error preparing booking notification:', notifError);
      // Don't fail the booking if notification fails
    }

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ renterId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('itemId', 'title images rentPricePerDay salePrice')
      .populate('ownerId', 'name email phone');
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getOwnerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('itemId', 'title images rentPricePerDay salePrice')
      .populate('renterId', 'name email phone');
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404);
      return next(new Error('Booking not found'));
    }

    const isOwner = booking.ownerId.toString() === req.user._id.toString();
    const isRenter = booking.renterId.toString() === req.user._id.toString();
    if (!isOwner && !isRenter) {
      res.status(403);
      return next(new Error('You cannot cancel this booking'));
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    next(error);
  }
};


