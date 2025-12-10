import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Crown, Shirt, Gem, Filter, Watch, ShoppingBag, Footprints, Search, ArrowRight } from 'lucide-react';
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

  const categories = [
    { title: 'Traditional', image: '/images/cat-traditional.jpg', link: 'women:women-clothes-traditional' },
    { title: 'Western', image: '/images/cat-western.jpg', link: 'women:women-clothes-western' },
    { title: 'Accessories', image: '/images/cat-accessories.jpg', link: 'women:women-accessories' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-main.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white space-y-8 animate-fade-in-up">
          <p className="text-sm md:text-base font-medium tracking-[0.3em] uppercase text-secondary">
            Curated Luxury Rentals
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium leading-tight hero-text-shadow text-white">
            Vastra Vows<br />
            <span className="italic font-light text-secondary-light">Collection</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto font-light">
            Step into our chic sanctuary, where style meets sustainability. Explore our curated collection of jewellery and women's apparel.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/items"
              className="px-8 py-4 btn-primary text-white rounded-full font-serif text-lg transition-transform hover:-translate-y-1 shadow-lg"
            >
              Explore Collection
            </Link>
            {!token && (
              <Link
                to="/register"
                className="btn-outline border-white text-white hover:bg-white hover:text-primary"
              >
                Join the Tribe
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar (Floating) */}
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto glass-card rounded-full p-2 flex flex-col md:flex-row shadow-2xl">
          <div className="flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-gray-200">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Looking For?</label>
            <input
              type="text"
              placeholder="Lehenga, Gown, Sherwani..."
              className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 text-lg text-gray-800 placeholder-gray-400 font-medium"
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
            />
          </div>
          <div className="px-6 py-3 flex items-center">
            <button
              onClick={handleSearch}
              className="bg-primary text-white p-4 rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              title="Search"
            >
              <Search className="w-5 h-5" />
              <span className="font-bold tracking-wider text-sm md:hidden">FIND</span>
            </button>
          </div>
        </div>
      </div>


      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">

        {/* Featured Categories */}
        <section>
          <div className="text-center mb-12 space-y-4">
            <div className="flex justify-center mb-4 text-secondary">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="M4.93 4.93l1.41 1.41"></path>
                <path d="M17.66 17.66l1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="M6.34 17.66l-1.41 1.41"></path>
                <path d="M19.07 4.93l-1.41 1.41"></path>
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-display text-primary italic">Welcome to Vastra Vows</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Welcome to our chic sanctuary, where style meets sustainability. Step into a world of organic elegance and modern domination as you explore our curated collection of jewellery and women's apparel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => {
                  setSearchCategory(cat.link);
                  setGenderFilter('women');
                  document.getElementById('items-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="relative w-full aspect-[3/4] mask-arch overflow-hidden mb-4 shadow-lg transition-transform duration-500 group-hover:-translate-y-2">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Label overlay at bottom inside the arch, similar to reference */}
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-primary/90 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-white font-display text-lg tracking-wider">Explore</span>
                  </div>
                </div>

                {/* Boxed Label below */}
                <div className="bg-primary text-white py-3 px-8 text-sm uppercase tracking-widest font-serif shadow-md transition-colors group-hover:bg-primary-dark">
                  {cat.title}
                </div>
                <span className="mt-2 text-xs text-secondary-light group-hover:text-primary transition-colors">{cat.title} +</span>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Items */}
        <section id="items-grid" className="scroll-mt-24">
          <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-display text-primary mb-2">Trending Now</h2>
              <p className="text-gray-500">Fresh from the runway to your wardrobe</p>
            </div>

            {/* Gender Toggle */}
            <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
              <button
                onClick={() => setGenderFilter('women')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${genderFilter === 'women' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Women
              </button>
              <button
                onClick={() => setGenderFilter('men')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${genderFilter === 'men' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Men
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
              <p className="text-gray-500">No items found in this collection yet.</p>
              <button onClick={() => { setSearchCategory(''); setSearchPrompt(''); }} className="mt-4 text-primary font-medium hover:underline">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link to="/items" className="inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-colors">
              <span>View All Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </main>
    </div >
  );
};

export default HomePage;
