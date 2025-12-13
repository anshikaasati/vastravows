import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { wishlistApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

const ItemCard = ({ item }) => {
  const { token } = useAuth();
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
    <Link to={`/items/${item._id}`} className="group block h-full">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
        {/* Badge */}
        {item.salePrice ? (
          <span className="absolute top-2 left-2 bg-[#880e28] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 z-10">
            For Sale
          </span>
        ) : (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 z-10">
            Rental
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggle}
          className="absolute top-2 right-2 p-2.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white backdrop-blur-sm transition-all duration-300 z-10"
        >
          <Heart className={`w-5 h-5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>

        <img
          src={item.images?.[0] || `https://placehold.co/600x800/9d174d/fce7f3?text=${encodeURIComponent(item.title)}`}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Quick Action Button - Appears on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center pb-6">
          <span className="bg-white/90 backdrop-blur text-primary text-xs font-bold uppercase tracking-widest px-6 py-3 shadow-lg hover:bg-primary hover:text-white transition-colors">
            View Details
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-gray-900 font-display text-base tracking-wide truncate px-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center justify-center gap-2 text-sm">
          {item.salePrice ? (
            <span className="text-gray-900 font-medium">₹{item.salePrice}</span>
          ) : (
            <span className="text-gray-700 font-medium">₹{item.rentPricePerDay}<span className="text-gray-400 text-xs font-normal">/day</span></span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
