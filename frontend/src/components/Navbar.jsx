import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Menu, X, ShoppingBag, Heart, User, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/items' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'FAQs', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`sticky z-50 transition-all duration-500 w-full ${scrolled
      ? 'top-3 bg-white/60 backdrop-blur-xl border-b border-gold/20 shadow-md'
      : 'top-3 bg-white/60 backdrop-blur-xl border-b border-gold/20 shadow-md py-3'
      }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${scrolled ? 'py-3' : ''}`}>

          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              <img src="/images/logo.png" alt="VV Logo" className="w-full h-full object-cover -translate-x-1" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-primary tracking-tight leading-none group-hover:text-secondary transition-colors">
                Vastra Vows
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-secondary font-medium pl-0.5">
                Luxe Rentals
              </p>
            </div>
          </Link>

          {/* Desktop Nav - Center */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs uppercase font-display tracking-[0.2em] transition-colors relative group py-1 ${isActive ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
                    }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                </Link>
              );
            })}
          </nav>

          {/* Actions - Right */}
          <div className="flex items-center gap-3">
            {/* Search Toggle */}
            <div className="relative flex items-center">
              <div className={`flex items-center transition-all duration-300 ${searchOpen ? 'w-48 opacity-100 mr-2' : 'w-0 opacity-0 overflow-hidden'}`}>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-1.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  if (searchOpen && searchQuery) {
                    handleSearch();
                  } else {
                    setSearchOpen(!searchOpen);
                  }
                }}
                className={`p-2 transition-colors ${searchOpen ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-primary transition-colors group">
              <Heart className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-xl transform scale-0 group-hover:scale-100 transition-transform shadow-sm"></span>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary transition-colors group">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-xl transform scale-0 group-hover:scale-100 transition-transform shadow-sm"></span>
            </Link>

            {/* Profile / Auth */}
            {user ? (
              <div className="hidden md:block relative group">
                <button className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary overflow-hidden hover:bg-primary/10 transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col z-50">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-primary">Hi! {user.name?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  <Link to="/profile" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary flex items-center gap-2">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={handleLogout} className="px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary hover:text-secondary transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl animate-fade-in-up">
          <div className="p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium hover:text-primary transition-colors flex justify-between items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2"></div>
            {user ? (
              <>
                <Link to="/profile" className="block px-4 py-3 text-gray-700 font-medium hover:text-primary">Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl">Logout</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-2">
                <Link to="/login" className="flex items-center justify-center py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700">Login</Link>
                <Link to="/register" className="flex items-center justify-center py-2.5 rounded-xl bg-primary text-white font-medium shadow-md">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
