import Wishlist from '../models/Wishlist.js';
import Item from '../models/Item.js';

export const toggleWishlist = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    const existing = await Wishlist.findOne({ userId: req.user._id, itemId });

    if (existing) {
      await existing.deleteOne();
      return res.json({ message: 'Removed from wishlist', action: 'removed' });
    } else {
      const doc = await Wishlist.create({ userId: req.user._id, itemId });
      const populated = await doc.populate('itemId', 'title images rentPricePerDay salePrice gender category subcategory');
      return res.status(201).json({ message: 'Added to wishlist', action: 'added', item: populated });
    }
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




