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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16 space-y-4">
          <span className="text-primary font-bold tracking-widest uppercase text-xs">Curated For You</span>
          <h1 className="text-5xl md:text-7xl font-script text-primary/90 mb-6">My Wishlist</h1>
          <p className="text-gray-500 font-light max-w-lg text-lg">
            Your personal collection of favorites. Ready when you are to make a statement.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center max-w-xl mx-auto border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-2xl font-display font-medium text-gray-900 mb-3">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-8 font-light leading-relaxed">
                Explore our exclusive collection and save the styles that speak to you.
              </p>
              <a href="/items" className="inline-block px-8 py-4 bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                Explore Collection
              </a>
            </div>
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
    </div>
  );
};
export default WishlistPage;


