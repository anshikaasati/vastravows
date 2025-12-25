import Item from '../models/Item.js';
import Review from '../models/Review.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { buildExpandedSearchQuery } from '../utils/searchUtils.js';

const mapLocation = (body) => ({
    city: body?.location?.city || body.city,
    pincode: body?.location?.pincode || body.pincode
});

export const createNewItem = async (userData, body, files) => {
    // Check listing limit for non-subscribed users
    if (userData.subscriptionStatus !== 'active') {
        const existingItemsCount = await Item.countDocuments({ ownerId: userData._id });
        if (existingItemsCount >= 10) {
            throw new Error('Free tier limit reached (10 items). Upgrade to Premium for unlimited listings.');
        }
    }

    const imageUrls = [];
    if (files?.length) {
        for (const file of files) {
            const uploadResult = await uploadToCloudinary(file.buffer);
            imageUrls.push(uploadResult.secure_url);
        }
    }

    const item = await Item.create({
        ownerId: userData._id,
        title: body.title,
        description: body.description,
        gender: body.gender,
        category: body.category,
        subcategory: body.subcategory,
        size: body.size,
        images: imageUrls,
        rentPricePerDay: body.rentPricePerDay,
        salePrice: body.salePrice,
        depositAmount: body.depositAmount || 0,
        location: mapLocation(body),
        addressLine: body.addressLine
    });

    return item;
};

export const fetchItems = async (query) => {
    const filters = {};
    if (query.category) filters.category = query.category;
    if (query.gender) filters.gender = query.gender;
    if (query.subcategory) filters.subcategory = query.subcategory;
    if (query.location) {
        // partial match on city (case-insensitive)
        filters['location.city'] = new RegExp(query.location, 'i');
    }

    // Advanced Semantic Search
    if (query.search) {
        const searchQuery = buildExpandedSearchQuery(query.search);
        // Merge the $and condition into filters
        if (searchQuery.$and) {
            filters.$and = searchQuery.$and;
        }
    }

    if (query.ownerId) filters.ownerId = query.ownerId;

    return await Item.find(filters).sort({ createdAt: -1 }).populate('ownerId', 'name email phone avatarUrl');
};

export const fetchItemById = async (id) => {
    const item = await Item.findById(id).populate('ownerId', 'name email phone avatarUrl');
    if (!item) {
        throw new Error('Item not found');
    }

    const reviews = await Review.find({ itemId: item._id }).populate('reviewerId', 'name avatarUrl');

    return { item, reviews };
};

export const updateItemDetails = async (id, userData, body, files) => {
    const item = await Item.findById(id);
    if (!item) {
        throw new Error('Item not found');
    }

    if (item.ownerId.toString() !== userData._id.toString()) {
        throw new Error('You can only update your own items');
    }

    const updates = { ...body };
    if (files?.length) {
        const newImages = [];
        for (const file of files) {
            const uploadResult = await uploadToCloudinary(file.buffer);
            newImages.push(uploadResult.secure_url);
        }
        updates.images = [...item.images, ...newImages];
    }

    if (body.city || body.pincode || body.location) {
        updates.location = mapLocation(body);
    }

    const updatedItem = await Item.findByIdAndUpdate(id, updates, { new: true });
    return updatedItem;
};

export const deleteItemById = async (id, userData) => {
    const item = await Item.findById(id);
    if (!item) {
        throw new Error('Item not found');
    }

    if (item.ownerId.toString() !== userData._id.toString()) {
        throw new Error('You can only delete your own items');
    }

    await item.deleteOne();
    return { message: 'Item deleted' };
};

export const fetchRecommendations = async (id) => {
    const currentItem = await Item.findById(id);

    if (!currentItem) {
        throw new Error('Item not found');
    }

    // 1. Fetch potential candidates
    // Primary Filter: Same Gender, Active, Not the current item
    const candidates = await Item.find({
        _id: { $ne: currentItem._id },
        gender: currentItem.gender
        // isActive: true // Temporarily removed
    }).select('title category subcategory gender rentPricePerDay salePrice images rating location ownerId');

    // 2. Score candidates
    const scoredCandidates = candidates.map(item => {
        let score = 0;

        // Category Match (High Importance)
        if (item.category === currentItem.category) {
            score += 10;
        }

        // Subcategory Match (Highest Importance)
        if (item.subcategory === currentItem.subcategory) {
            score += 15;
        }

        // Price Similarity (±20%)
        const price = item.salePrice || item.rentPricePerDay;
        const currentPrice = currentItem.salePrice || currentItem.rentPricePerDay;

        if (price && currentPrice) {
            const lowerBound = currentPrice * 0.8;
            const upperBound = currentPrice * 1.2;
            if (price >= lowerBound && price <= upperBound) {
                score += 5;
            }
        }

        return { item, score };
    });

    // 3. Sort and Limit
    scoredCandidates.sort((a, b) => {
        // Sort by score first (descending)
        if (b.score !== a.score) return b.score - a.score;
        // Fallback
        return 0;
    });

    return scoredCandidates.slice(0, 12).map(entry => entry.item);
};
