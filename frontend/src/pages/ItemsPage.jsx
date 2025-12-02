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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900 tracking-tight">Designer Collection</h2>
          <p className="text-gray-500 mt-2">Curated luxury rentals for your special moments</p>
        </div>
      </div>

      {/* Filters & Categories */}
      <div className="glass-panel rounded-3xl p-6 mb-10 space-y-6">
        <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-200/50">
          {['women', 'men'].map((gender) => (
            <button
              key={gender}
              onClick={() => handleGenderToggle(gender)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${genderFilter === gender
                  ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                  : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-md'
                }`}
            >
              {gender === 'women' ? 'Women\'s Collection' : 'Men\'s Collection'}
            </button>
          ))}
          <button
            onClick={() => handleCategoryFilter('')}
            className="ml-auto px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition flex items-center shadow-sm hover:shadow-md"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {categoryOptions[genderFilter].map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleCategoryFilter(value)}
              className={`px-5 py-2.5 rounded-2xl font-medium transition-all duration-200 flex items-center border ${activeCategoryValue === value
                  ? 'bg-primary-berry/10 border-primary-berry text-primary-berry shadow-sm'
                  : 'bg-white/40 border-transparent hover:bg-white hover:shadow-sm text-gray-600'
                }`}
            >
              <Icon className={`w-4 h-4 mr-2 ${activeCategoryValue === value ? 'text-primary-berry' : 'text-gray-400'}`} />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
};

export default ItemsPage;
