import { validationResult } from 'express-validator';
import Item from '../models/Item.js';
import Review from '../models/Review.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const mapLocation = (body) => ({
  city: body?.location?.city || body.city,
  pincode: body?.location?.pincode || body.pincode
});

export const createItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const imageUrls = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.buffer);
        imageUrls.push(uploadResult.secure_url);
      }
    }

    const item = await Item.create({
      ownerId: req.user._id,
      title: req.body.title,
      description: req.body.description,
      gender: req.body.gender,
      category: req.body.category,
      subcategory: req.body.subcategory,
      size: req.body.size,
      images: imageUrls,
      rentPricePerDay: req.body.rentPricePerDay,
      salePrice: req.body.salePrice,
      depositAmount: req.body.depositAmount || 0,
      location: mapLocation(req.body),
      addressLine: req.body.addressLine
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const getItems = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.gender) filters.gender = req.query.gender;
    if (req.query.subcategory) filters.subcategory = req.query.subcategory;
    if (req.query.location) {
      // partial match on city (case-insensitive)
      filters['location.city'] = new RegExp(req.query.location, 'i');
    }
    if (req.query.ownerId) filters.ownerId = req.query.ownerId;

    const items = await Item.find(filters).sort({ createdAt: -1 }).populate('ownerId', 'name email phone avatarUrl');
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('ownerId', 'name email phone avatarUrl');
    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    const reviews = await Review.find({ itemId: item._id }).populate('reviewerId', 'name avatarUrl');

    res.json({ item, reviews });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    if (item.ownerId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('You can only update your own items'));
    }

    const updates = { ...req.body };
    if (req.files?.length) {
      const newImages = [];
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.buffer);
        newImages.push(uploadResult.secure_url);
      }
      updates.images = [...item.images, ...newImages];
    }

    if (req.body.city || req.body.pincode || req.body.location) {
      updates.location = mapLocation(req.body);
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    if (item.ownerId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('You can only delete your own items'));
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};


