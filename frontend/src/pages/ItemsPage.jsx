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
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 tracking-tight">All Designer Looks</h2>

      {/* Filters & Categories */}
      <div className="flex flex-col gap-3 mb-10">
        <div className="flex gap-2">
          {['women', 'men'].map((gender) => (
            <button
              key={gender}
              onClick={() => handleGenderToggle(gender)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${genderFilter === gender ? 'bg-primary-berry text-white' : 'bg-white text-gray-700'
                }`}
            >
              {gender === 'women' ? 'Women' : 'Men'}
            </button>
          ))}
          <button
            onClick={() => handleCategoryFilter('')}
            className="ml-auto text-sm px-4 py-2 rounded-full bg-white border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition flex items-center shadow-sm"
          >
            <Filter className="w-4 h-4 mr-1" />
            All Categories
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {categoryOptions[genderFilter].map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleCategoryFilter(value)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition shadow-md flex items-center border ${activeCategoryValue === value
                ? 'bg-primary-berry/20 border-primary-berry text-primary-berry'
                : 'bg-white'
                }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found in this category.</p>
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
