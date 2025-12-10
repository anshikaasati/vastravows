import { useEffect, useState } from 'react';
import { wishlistApi } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';
import ItemCard from '../components/ItemCard';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const { data } = await wishlistApi.list();
      // Each entry has { itemId: {...}, _id }
      setItems(data.map((w) => w.itemId).filter(Boolean));
    } catch {
      toast.error('Unable to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center justify-center text-center my-12 space-y-4">
        <h2 className="text-4xl md:text-5xl font-display font-medium text-primary italic">My Wishlist</h2>
        <div className="w-16 h-1 bg-secondary mx-auto"></div>
        <p className="text-gray-500 max-w-lg mx-auto font-light">Your curated list of favorites. Ready when you are.</p>
      </div>

      {items.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✨</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500">Explore the collection and save your favorite styles!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item._id} className="h-full">
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;


