import Wishlist from '../models/Wishlist.js';
import Item from '../models/Item.js';

export const addToWishlist = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    const doc = await Wishlist.findOneAndUpdate(
      { userId: req.user._id, itemId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const populated = await doc.populate('itemId', 'title images rentPricePerDay salePrice gender category subcategory');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const list = await Wishlist.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('itemId', 'title images rentPricePerDay salePrice gender category subcategory location');
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    await Wishlist.findOneAndDelete({ userId: req.user._id, itemId });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
};


