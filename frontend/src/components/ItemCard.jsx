import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { wishlistApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

const ItemCard = ({ item }) => {
  const { token } = useAuth();
  const categoryColors = {
    clothes: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', ring: 'ring-primary-berry/20' },
    jewellery: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', ring: 'ring-teal-300/50' },
    accessories: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', ring: 'ring-purple-300/50' },
    watch: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', ring: 'ring-blue-300/50' },
    shoes: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', ring: 'ring-orange-300/50' }
  };
  const colors = categoryColors[item.category] || { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', ring: 'ring-indigo-300/20' };

  const getBadgeText = () => {
    if (item.salePrice) return 'FOR SALE';
    const categoryBadges = {
      jewellery: 'JEWELRY RENTAL',
      accessories: 'ACCESSORIES RENTAL',
      watch: 'WATCH RENTAL',
      shoes: 'SHOES RENTAL'
    };
    return categoryBadges[item.category] || 'PREMIUM RENTAL';
  };

  const getBadgeColor = () => {
    if (item.salePrice) return 'bg-gray-700';
    const categoryBadges = {
      jewellery: 'bg-teal-600',
      accessories: 'bg-purple-600',
      watch: 'bg-blue-600',
      shoes: 'bg-orange-600'
    };
    return categoryBadges[item.category] || 'bg-primary-berry';
  };

  const badgeText = getBadgeText();
  const badgeColor = getBadgeColor();

  // Calculate average rating (mock for now, can be enhanced with actual reviews)
  const avgRating = 4.5;
  const reviewCount = 12;

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(item._id);

  const handleToggle = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please login to add to wishlist');
      return;
    }
    await toggleWishlist(item._id);
  };

  return (
    <Link to={`/items/${item._id}`}>
      <div
        className={`glass-panel rounded-3xl overflow-hidden transition duration-300 relative group cursor-pointer border border-white/50 ring-1 ${colors.ring}`}
      >
        <span className={`absolute top-4 left-4 ${badgeColor} text-white text-xs font-bold uppercase px-3 py-1.5 rounded-full shadow-lg z-10`}>
          {badgeText}
        </span>
        <button
          onClick={handleToggle}
          className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/40 hover:bg-red-500 transition duration-200 z-10"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
        </button>
        <div className="h-64 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <img
            src={item.images?.[0] || `https://placehold.co/600x400/9d174d/fce7f3?text=${encodeURIComponent(item.title)}`}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 transform ease-in-out"
            onError={(e) => {
              e.target.src = `https://placehold.co/600x400/9d174d/fce7f3?text=${encodeURIComponent(item.title)}`;
            }}
          />
        </div>
        <div className="p-5 space-y-3">
          <h3 className="text-xl font-bold text-gray-900 truncate">{item.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary-gold" />
            {item.location?.city || 'Location not specified'}
          </p>
          <div className="flex items-center justify-between">
            {item.salePrice ? (
              <span className="text-3xl font-extrabold text-gray-900">
                ₹{item.salePrice}
              </span>
            ) : (
              <span className="text-3xl font-extrabold text-secondary-gold">
                ₹{item.rentPricePerDay}
                <span className="text-sm font-medium text-gray-500">/day</span>
              </span>
            )}
            <div className="flex items-center text-yellow-500">
              <Star className="w-5 h-5 fill-yellow-500 mr-1" />
              <span className="text-base font-semibold text-gray-700">
                {avgRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
            {item.gender} • {item.subcategory?.replace(/-/g, ' ')}
          </p>
          <button className="mt-2 w-full text-white py-3 rounded-xl font-semibold text-base btn-gradient-vows shadow-md">
            {item.salePrice ? 'Purchase Now' : 'Book Fitting'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
