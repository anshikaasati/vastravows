import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Crown, Shirt, Gem, Filter, Watch, ShoppingBag, Footprints } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import { itemApi } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGender = searchParams.get('gender') || 'women';
  const initialSubcategory = searchParams.get('subcategory') || '';
  const [genderFilter, setGenderFilter] = useState(initialGender);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const activeCategoryValue = subcategory ? `${genderFilter}:${subcategory}` : '';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = {};
        const search = searchParams.get('search');
        if (search) params.search = search;
        if (genderFilter) params.gender = genderFilter;
        if (subcategory) params.subcategory = subcategory;
        const { data } = await itemApi.getAll(params);
        setItems(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [genderFilter, subcategory, searchParams]);

  useEffect(() => {
    setGenderFilter(searchParams.get('gender') || 'women');
    setSubcategory(searchParams.get('subcategory') || '');
  }, [searchParams]);

  const handleGenderToggle = (gender) => {
    setGenderFilter(gender);
    setSubcategory('');
    const next = new URLSearchParams();
    if (gender) next.set('gender', gender);
    setSearchParams(next);
  };

  const handleCategoryFilter = (value) => {
    if (!value) {
      setSubcategory('');
      const next = new URLSearchParams();
      if (genderFilter) next.set('gender', genderFilter);
      setSearchParams(next);
      return;
    }
    const [g, sub] = value.split(':');
    const appliedGender = g || genderFilter;
    setGenderFilter(appliedGender);
    setSubcategory(sub || '');
    const next = new URLSearchParams();
    if (appliedGender) next.set('gender', appliedGender);
    if (sub) next.set('subcategory', sub);
    setSearchParams(next);
  };

  const categoryOptions = {
    women: [
      { label: 'Women – Western', value: 'women:women-clothes-western', icon: Shirt },
      { label: 'Women – Traditional', value: 'women:women-clothes-traditional', icon: Crown },
      { label: 'Women – Jewellery', value: 'women:women-jewellery', icon: Gem },
      { label: 'Women – Accessories', value: 'women:women-accessories', icon: ShoppingBag },
      { label: 'Women – Shoes', value: 'women:women-shoes', icon: Footprints },
      { label: 'Women – Watches', value: 'women:women-watches', icon: Watch }
    ],
    men: [
      { label: 'Men – Western', value: 'men:men-clothes-western', icon: Shirt },
      { label: 'Men – Traditional', value: 'men:men-clothes-traditional', icon: Crown },
      { label: 'Men – Watches', value: 'men:men-watches', icon: Watch },
      { label: 'Men – Shoes', value: 'men:men-shoes', icon: Footprints },
      { label: 'Men – Accessories', value: 'men:men-accessories', icon: ShoppingBag }
    ]
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center justify-center text-center my-16 space-y-6">
        <h2 className="text-6xl md:text-8xl font-script text-primary/90">The Collection</h2>
        <div className="w-16 h-0.5 bg-primary/20 mx-auto"></div>
        <p className="text-gray-500 max-w-lg mx-auto font-medium tracking-wide text-sm leading-relaxed">
          Explore our handpicked curation of luxury wear, where every piece tells a story of elegance and grace.
        </p>
      </div>

      {/* Filters & Categories */}
      {/* Minimalist Filters */}
      <div className="mb-16 flex flex-col items-center space-y-6">
        <div className="flex bg-white rounded-xl p-1 border border-secondary/30 shadow-sm">
          {['women', 'men'].map((gender) => (
            <button
              key={gender}
              onClick={() => handleGenderToggle(gender)}
              className={`px-8 py-3 rounded-xl text-sm uppercase tracking-widest font-medium transition-all duration-300 ${genderFilter === gender
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:text-primary'
                }`}
            >
              {gender === 'women' ? 'Women' : 'Men'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => handleCategoryFilter('')}
            className={`px-6 py-2 rounded-xl border text-xs uppercase tracking-wider transition-colors ${!activeCategoryValue ? 'border-primary bg-primary text-white' : 'border-secondary/30 text-gray-500 hover:border-primary'}`}
          >
            All
          </button>
          {categoryOptions[genderFilter].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleCategoryFilter(value)}
              className={`px-6 py-2 rounded-xl border text-xs uppercase tracking-wider transition-colors ${activeCategoryValue === value
                ? 'border-primary bg-primary text-white'
                : 'border-secondary/30 text-gray-500 hover:border-primary hover:text-primary'
                }`}
            >
              {label.split('–')[1].trim()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <div key={item._id} className="h-full">
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default ItemsPage;
