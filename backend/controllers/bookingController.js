import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Item from '../models/Item.js';

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
      paymentMethod, depositPaymentMethod, rentPaymentMethod
    } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    // Only check for overlaps if it's a rental (rentPrice > 0)
    // If it's a sale, maybe we check if it's already sold? 
    // For now, assuming rental logic applies or sale is one-off.
    // If sale, we might want to mark item as sold?

    if (item.rentPricePerDay > 0) {
      const conflicts = await findOverlappingBookings({ itemId, startDate: parsedStart, endDate: parsedEnd });
      if (conflicts.length) {
        res.status(400);
        return next(new Error('Selected dates overlap with existing booking'));
      }
    }

    let totalAmount = 0;
    let rentAmount = 0;
    let depositAmount = 0;

    if (item.rentPricePerDay > 0) {
      // Rental
      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      const days = Math.max(1, Math.ceil((parsedEnd - parsedStart) / millisecondsPerDay));
      rentAmount = days * item.rentPricePerDay;
      depositAmount = item.depositAmount || 0;
      totalAmount = rentAmount + depositAmount;
    } else {
      // Sale
      totalAmount = item.salePrice || 0;
    }

    const booking = await Booking.create({
      itemId,
      renterId: req.user._id,
      ownerId: item.ownerId,
      startDate: parsedStart,
      endDate: parsedEnd,
      totalAmount,
      rentAmount,
      depositAmount,
      renterName,
      phoneNumber,
      size,
      deliveryAddress,
      pickupAddress,
      location,
      paymentMethod,
      depositPaymentMethod,
      rentPaymentMethod,
      status: 'pending'
    });

    const populated = await booking.populate('itemId renterId ownerId', 'title name email phone images');

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


