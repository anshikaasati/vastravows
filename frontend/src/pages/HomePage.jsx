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
    { title: 'Traditional', image: '/images/cat-traditional.jpg?v=2', link: 'women:women-clothes-traditional' },
    { title: 'Western', image: '/images/cat-western.jpg?v=2', link: 'women:women-clothes-western' },
    { title: 'Accessories', image: '/images/cat-accessories.jpg?v=2', link: 'women:women-accessories' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen sm:h-[90vh] md:h-[110vh] -mt-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-main.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 container mt-12 sm:mt-20 mx-auto px-4 text-center text-white space-y-6 sm:space-y-8 animate-fade-in-up">
          <p className="text-xs sm:text-sm font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white/90">
            Curated Luxury Rentals
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-normal leading-tight hero-text-shadow text-white">
            Vastra Vows<br />
            <span className="italic font-normal text-white">Collection</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto font-light leading-relaxed px-4">
            Step into our chic sanctuary, where style meets sustainability. Explore our curated collection of jewellery and women's apparel.
          </p>

          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <Link
              to="/items"
              className="px-8 sm:px-10 py-3 sm:py-4 text-white uppercase tracking-widest text-xs font-bold rounded-xl shadow-2xl hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300"
              style={{
                background: 'linear-gradient(90deg, #d48496 0%, #760a1e 100%)'
              }}
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar (Floating) */}
      <div className="container mx-auto px-4 -mt-8 sm:-mt-10 relative z-20">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-full p-3 sm:p-2 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0">
          <div className="flex-1 px-4 sm:px-10 py-3 sm:py-4">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Looking For?</label>
            <input
              type="text"
              placeholder="Lehenga, Gown, Sherwani..."
              className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 text-lg sm:text-xl text-gray-800 placeholder-gray-300 font-display italic"
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
            />
          </div>
          <div className="p-1">
            <button
              onClick={handleSearch}
              className="w-full sm:w-14 h-12 sm:h-14 rounded-xl text-[#600000] flex items-center justify-center transition-all duration-300 hover:scale-105 font-bold uppercase tracking-widest text-xs sm:text-base"
              title="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 sm:inline hidden" />
              <span className="sm:hidden">Search</span>
            </button>
          </div>
        </div>
      </div>


      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">

        {/* Featured Categories */}
        <section>
          <div className="text-center mb-12 sm:mb-16 space-y-2 px-4">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-script text-primary/80 mb-3 sm:mb-4">Welcome to Vastra Vows</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed tracking-wide font-medium">
              Welcome to our chic sanctuary, where style meets sustainability. Step into a world of organic elegance and modern domination as you explore our curated collection of jewellery and women&apos;s apparel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
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
                {/* Arch-shaped image container */}
                <div className="relative w-full aspect-[3/4] mask-arch overflow-hidden shadow-xl transition-all duration-500 group-hover:shadow-2xl">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Label box inside arch at bottom - matches reference */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur-sm px-8 py-3 rounded-sm">
                    <h3 className="text-white font-display text-base md:text-lg text-center tracking-wide whitespace-nowrap">
                      {cat.title}
                    </h3>
                  </div>
                </div>

                {/* Subtitle below card - matches reference */}
                <p className="mt-3 text-sm text-gray-500 group-hover:text-primary transition-colors">
                  {cat.title} →
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* New Arrivals Section (Replaces Trending From UI) */}
        <section id="items-grid" className="scroll-mt-24">
          <div className="text-center mb-8 sm:mb-10 px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display text-primary mb-2 uppercase tracking-tight">New Arrivals</h2>
            <div className="hidden w-16 h-0.5 bg-primary/20 mx-auto"></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No items found.</p>
              <button onClick={() => { setSearchCategory(''); setSearchPrompt(''); }} className="mt-4 text-primary font-medium hover:underline">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
              {/* New Arrivals: Sort by createdAt (descending) */}
              {[...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4).map((item) => (
                <Link key={item._id} to={`/items/${item._id}`} className="group block">
                  {/* Minimal Card Style */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                    <img
                      src={item.images?.[0] || `https://placehold.co/600x800/9d174d/fce7f3?text=${item.title}`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-gray-900 font-display text-base tracking-wide truncate px-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm font-medium">
                      {item.salePrice ? `₹${item.salePrice}` : `₹${item.rentPricePerDay}/day`}
                    </p>
                  </div>
                  <button className="w-full mt-4 py-2.5 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.15em] hover:bg-primary hover:text-white transition-all duration-300">
                    Add to Cart
                  </button>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/items" className="inline-block text-sm font-semibold text-primary border-b border-primary hover:text-primary-dark transition-colors pb-0.5">
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </section>

        {/* Best Sellers Section */}
        <section className="bg-white -mx-4 sm:-mx-6 lg:-mx-8 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image Left */}
              <div className="relative h-[500px] w-full flex items-center justify-center">
                <Link to="/items/693d21c77c2a5bc856eda393" className="absolute w-[80%] h-full mask-arch bg-gray-200 shadow-2xl overflow-hidden group cursor-pointer">
                  <img
                    src="/images/bestseller.jpeg"
                    alt="Best Seller"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
                {/* Decorative Circle Badge */}
                <div className="absolute top-10 right-[15%] w-24 h-24 rounded-full bg-primary text-white flex flex-col items-center justify-center p-2 text-center rotate-12 shadow-lg animate-float pointer-events-none">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Best</span>
                  <span className="text-xs font-display italic">Sellers</span>
                </div>
              </div>

              {/* Text Right */}
              <div className="text-center md:text-left space-y-4 sm:space-y-6 px-4">
                <p className="font-script text-2xl sm:text-4xl md:text-6xl text-secondary-dark transform -rotate-6 origin-bottom-left inline-block mb-2 sm:mb-4">Let&apos;s shop our</p>
                <h2 className="text-4xl sm:text-6xl md:text-8xl font-display text-primary leading-none tracking-tight">
                  BEST<br />SELLERS
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto md:mx-0 font-light">
                  Our most loved pieces, rented and adored by hundreds of happy customers. Experience luxury without the commitment.
                </p>
                <div className="pt-2 sm:pt-4">
                  <Link to="/items/693d21c77c2a5bc856eda393" className="inline-block px-8 sm:px-10 py-3 sm:py-4 border border-primary text-primary font-serif uppercase tracking-widest text-xs sm:text-sm rounded-none hover:bg-primary hover:text-white transition-all duration-300">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Sellers Grid */}
        <section>
          <div className="text-center mb-8 sm:mb-10 px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display text-primary mb-2 uppercase tracking-tight">Best Sellers</h2>
            <div className="hidden w-16 h-0.5 bg-primary/20 mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
            {/* Best Sellers: Sort by rating (descending), then Price (descending) as tie-breaker */}
            {[...items]
              .sort((a, b) => {
                const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
                if (ratingDiff !== 0) return ratingDiff;
                // If ratings are equal (e.g., all 0), sort by price to differentiate from New Arrivals
                const priceA = a.salePrice || a.rentPricePerDay || 0;
                const priceB = b.salePrice || b.rentPricePerDay || 0;
                return priceB - priceA;
              })
              .slice(0, 4)
              .map((item) => (
                <Link key={`bs-${item._id}`} to={`/items/${item._id}`} className="group block">
                  {/* Minimal Card Style */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                    <img
                      src={item.images?.[0] || `https://placehold.co/600x800/9d174d/fce7f3?text=${item.title}`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1">
                      Best Seller
                    </span>
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-gray-900 font-display text-base tracking-wide truncate px-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm font-medium">
                      {item.salePrice ? `₹${item.salePrice}` : `₹${item.rentPricePerDay}/day`}
                    </p>
                  </div>
                  <button className="w-full mt-4 py-2.5 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.15em] hover:bg-primary hover:text-white transition-all duration-300">
                    Add to Cart
                  </button>
                </Link>
              ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/items?sort=best_selling" className="inline-block text-sm font-semibold text-primary border-b border-primary hover:text-primary-dark transition-colors pb-0.5">
              SHOP BEST SELLERS
            </Link>
          </div>
        </section>

      </main>
    </div >
  );
};

export default HomePage;
