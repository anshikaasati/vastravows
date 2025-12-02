import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Crown, Shirt, Gem, Filter, Watch, ShoppingBag, Footprints } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import { itemApi } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchPrompt, setSearchPrompt] = useState('');
  const [genderFilter, setGenderFilter] = useState('women');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const params = {};
        if (searchCategory) {
          const [gender, subcategory] = searchCategory.split(':');
          if (gender) params.gender = gender;
          if (subcategory) params.subcategory = subcategory;
        } else if (genderFilter) {
          params.gender = genderFilter;
        }
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
  }, [searchCategory, genderFilter]);

  const promptMap = [
    { value: 'women:women-clothes-traditional', keywords: ['lehenga', 'saree', 'bridal', 'traditional', 'indowestern', 'anarkali'] },
    { value: 'women:women-clothes-western', keywords: ['dress', 'gown', 'western', 'evening', 'cocktail'] },
    { value: 'women:women-jewellery', keywords: ['jewellery', 'necklace', 'earring', 'kundan', 'bracelet'] },
    { value: 'women:women-accessories', keywords: ['clutch', 'dupatta', 'accessory'] },
    { value: 'women:women-shoes', keywords: ['heels', 'sandals', 'juttis', 'shoes'] },
    { value: 'women:women-watches', keywords: ['watch', 'timepiece'] },
    { value: 'men:men-clothes-traditional', keywords: ['sherwani', 'kurta', 'bandhgala', 'traditional'] },
    { value: 'men:men-clothes-western', keywords: ['suit', 'tuxedo', 'blazer', 'western', 'jacket'] },
    { value: 'men:men-watches', keywords: ['watch', 'chronograph'] },
    { value: 'men:men-shoes', keywords: ['loafer', 'oxford', 'shoe'] },
    { value: 'men:men-accessories', keywords: ['safa', 'brooch', 'pocket square', 'tie', 'accessory'] }
  ];

  const inferCategoryFromPrompt = (text) => {
    if (!text?.trim()) return null;
    const prompt = text.toLowerCase();
    const match = promptMap.find((entry) => entry.keywords.some((word) => prompt.includes(word)));
    if (!match) {
      const fallbackGender = prompt.includes('men') || prompt.includes('groom') ? 'men' : prompt.includes('women') || prompt.includes('bride') ? 'women' : null;
      if (!fallbackGender) return null;
      return { gender: fallbackGender, subcategory: `${fallbackGender}-clothes-western` };
    }
    const [gender, subcategory] = match.value.split(':');
    return { gender, subcategory };
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.append('location', searchLocation);

    let effectiveCategory = searchCategory;
    if (!effectiveCategory && searchPrompt.trim()) {
      const inferred = inferCategoryFromPrompt(searchPrompt);
      if (inferred) {
        effectiveCategory = `${inferred.gender}:${inferred.subcategory}`;
        setGenderFilter(inferred.gender);
        setSearchCategory(effectiveCategory);
      } else {
        // Fallback to text search if no category inferred
        params.append('search', searchPrompt);
      }
    }

    if (effectiveCategory) {
      const [gender, subcategory] = effectiveCategory.split(':');
      if (gender) params.append('gender', gender);
      if (subcategory) params.append('subcategory', subcategory);
    } else if (genderFilter) {
      params.append('gender', genderFilter);
    }
    navigate(`/items?${params.toString()}`);
  };

  const categoryOptions = {
    women: [
      { label: 'Women – Western', value: 'women:women-clothes-western', icon: Crown },
      { label: 'Women – Traditional', value: 'women:women-clothes-traditional', icon: Crown },
      { label: 'Women – Jewellery', value: 'women:women-jewellery', icon: Gem },
      { label: 'Women – Accessories', value: 'women:women-accessories', icon: ShoppingBag },
      { label: 'Women – Shoes', value: 'women:women-shoes', icon: Footprints },
      { label: 'Women – Watches', value: 'women:women-watches', icon: Watch }
    ],
    men: [
      { label: 'Men – Western', value: 'men:men-clothes-western', icon: Shirt },
      { label: 'Men – Traditional', value: 'men:men-clothes-traditional', icon: Shirt },
      { label: 'Men – Watches', value: 'men:men-watches', icon: Watch },
      { label: 'Men – Shoes', value: 'men:men-shoes', icon: Footprints },
      { label: 'Men – Accessories', value: 'men:men-accessories', icon: ShoppingBag }
    ]
  };

  const handleCategoryFilter = (value) => {
    setSearchCategory(value === 'all' ? '' : value);
  };

  return (
    <div className="min-h-screen space-y-16">
      {/* Hero */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="hero-section relative overflow-hidden">
          <div className="hero-content grid lg:grid-cols-2 gap-12 p-10">
            <div className="text-left space-y-6">
              <p className="text-xs uppercase tracking-[0.5em] text-secondary-gold">Curated Luxury Rentals</p>
              <h1 className="text-4xl md:text-6xl font-display leading-tight text-midnight">
                Adorn your story with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-berry to-secondary-gold">couture elegance</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Discover designer lehengas, heirloom jewellery, heritage sherwanis, and statement accessories sourced from the country&apos;s most coveted closets.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/items" className="btn-gradient-vows px-6 py-3 rounded-full text-sm font-semibold">
                  Browse Collections
                </Link>
                {token ? (
                  <Link to="/wishlist" className="btn-gradient-outline px-6 py-3 rounded-full text-sm font-semibold">
                    View Wishlist
                  </Link>
                ) : (
                  <Link to="/register" className="btn-gradient-outline px-6 py-3 rounded-full text-sm font-semibold">
                    Become a Lender
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Designers', value: '120+' },
                  { label: 'Cities Served', value: '35' },
                  { label: 'Pieces Curated', value: '2.4k+' }
                ].map((stat) => (
                  <div key={stat.label} className="p-4 glass-panel rounded-2xl">
                    <p className="text-2xl font-semibold text-primary-berry">{stat.value}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-secondary-gold/30 to-primary-berry/30 blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'
                ].map((img, idx) => (
                  <div key={img} className={`rounded-2xl overflow-hidden shadow-glow ${idx % 2 ? 'translate-y-8' : ''}`}>
                    <img src={img} alt="Editorial couture" className="w-full h-48 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <br></br>
          {/* Search */}
          <div className="bg-white/90 mx-6 md:mx-16 -mt-10 rounded-3xl p-6 shadow-glow flex flex-col lg:flex-row lg:items-center gap-4 mb-12">
            {/* Location Input */}

            {/* Text prompt */}
            <div className="flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200">
              <label htmlFor="prompt" className="block text-xs font-semibold text-gray-500 mb-0.5 text-left">
                Describe the look
              </label>
              <input
                id="prompt"
                type="text"
                placeholder="“men sherwani with brooch” or “women bridal lehenga”"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                className="w-full text-base font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full md:w-auto px-7 py-3.5 btn-gradient-vows text-white font-semibold rounded-full flex items-center justify-center space-x-2 mt-2 md:mt-0 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-base">Find Attire</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
        {/* Filters & Categories */}
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-10">
          <div className="flex items-center justify-between w-full">
            <span className="text-base font-bold text-secondary-gold uppercase tracking-[0.3em]">
              Collections
            </span>
            <div className="flex gap-2">
              {['women', 'men'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => {
                    setGenderFilter(gender);
                    setSearchCategory('');
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border ${genderFilter === gender ? 'bg-primary-berry text-white' : 'bg-white text-gray-700'
                    }`}
                >
                  {gender === 'women' ? 'Women' : 'Men'}
                </button>
              ))}
            </div>
          </div>
          {categoryOptions[genderFilter].map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleCategoryFilter(value)}
              className={`text-sm px-4 py-4 rounded-full font-medium transition shadow-md flex items-center border ${searchCategory === value ? 'bg-primary-berry/20 border-primary-berry text-primary-berry' : 'bg-white'
                }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
          <button
            onClick={() => handleCategoryFilter('all')}
            className="text-sm px-4 py-2 rounded-full bg-white border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition flex items-center shadow-sm"
          >
            <Filter className="w-4 h-4 mr-1" />
            All Categories
          </button>
        </div>

        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 mt-4 tracking-tight">Trending Designer Looks</h2>

        {/* Product Listing Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found. Be the first to list an item!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
