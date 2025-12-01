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
      <h2 className="text-4xl font-extrabold text-gray-800 mb-6 tracking-tight">My Wishlist</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t added any items to your wishlist yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;


