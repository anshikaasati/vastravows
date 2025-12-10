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
    clothes: { bg: 'bg-[#FFF9F2]', text: 'text-primary', border: 'border-primary/20', ring: 'ring-primary/20' },
    jewellery: { bg: 'bg-[#FFF9F2]', text: 'text-[#6d0b20]', border: 'border-primary/20', ring: 'ring-primary/10' },
    accessories: { bg: 'bg-[#FFF9F2]', text: 'text-[#ff8597]', border: 'border-primary/20', ring: 'ring-primary/10' },
    watch: { bg: 'bg-[#FFF9F2]', text: 'text-[#4A3728]', border: 'border-primary/20', ring: 'ring-primary/10' },
    shoes: { bg: 'bg-[#FFF9F2]', text: 'text-primary', border: 'border-primary/20', ring: 'ring-primary/10' }
  };
  const colors = categoryColors[item.category] || { bg: 'bg-[#FFF9F2]', text: 'text-primary', border: 'border-primary/20', ring: 'ring-primary/20' };

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
    if (item.salePrice) return 'bg-[#880e28]'; // Darker Wine for Sale
    return 'bg-primary'; // Primary Wine for everything else
  };

  const badgeText = getBadgeText();
  const badgeColor = getBadgeColor();

  // Calculate average rating from actual reviews if they exist
  const avgRating = item.averageRating || 0;
  const reviewCount = item.reviewCount || 0;
  const hasRatings = reviewCount > 0;

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
        className={`glass-card rounded-3xl overflow-hidden relative group cursor-pointer ring-1 ${colors.ring}`}
      >
        <span className={`absolute top-4 left-4 ${badgeColor} text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg z-10`}>
          {badgeText}
        </span>
        <button
          onClick={handleToggle}
          className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/20 hover:bg-white hover:text-red-500 backdrop-blur-sm transition duration-200 z-10"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        <div className="h-72 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-[1]" />
          <img
            src={item.images?.[0] || `https://placehold.co/600x400/9d174d/fce7f3?text=${encodeURIComponent(item.title)}`}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 transform ease-out"
            onError={(e) => {
              e.target.src = `https://placehold.co/600x400/9d174d/fce7f3?text=${encodeURIComponent(item.title)}`;
            }}
          />
        </div>
        <div className="p-5 space-y-3 relative z-[2] -mt-10 pt-10 bg-gradient-to-b from-transparent to-white/90">
          {/* This gradient overlay might be tricky with glassmorphism, let's keep it clean */}
        </div>
        <div className="p-5 pt-0 space-y-3">
          <h3 className="text-lg font-display font-medium text-gray-900 truncate">{item.title}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-2 font-medium uppercase tracking-wide">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
            {item.location?.city || 'Location not specified'}
          </p>
          <div className="flex items-center justify-between">
            {item.salePrice ? (
              <span className="text-2xl font-display font-bold text-primary">
                ₹{item.salePrice}
              </span>
            ) : (
              <span className="text-2xl font-display font-bold text-primary">
                ₹{item.rentPricePerDay}
                <span className="text-xs font-sans font-medium text-gray-500 ml-1">/day</span>
              </span>
            )}
            {hasRatings && (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-bold text-gray-700">
                  {avgRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <button className="w-full py-3 rounded-xl font-medium text-sm btn-primary shadow-lg mt-2 opacity-90 group-hover:opacity-100 transition-opacity">
            {item.salePrice ? 'View Details' : 'Book Now'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
