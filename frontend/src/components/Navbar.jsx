import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'
      }`}>
      <div className={`transition-all duration-300 ${scrolled
        ? 'backdrop-blur-xl bg-white/80 shadow-glow border-b border-white/40'
        : 'bg-transparent'
        }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-berry via-rose-500 to-secondary-gold text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-xl tracking-wide text-primary-berry">Vastra Vows</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-secondary-gold font-semibold">
                Luxe Rentals
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <Link to="/items" className="hover:text-primary-berry transition relative group">
              Collections
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-berry transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/wishlist" className="hover:text-primary-berry transition relative group">
              Wishlist
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-berry transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/bookings" className="hover:text-primary-berry transition relative group">
              Bookings
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-berry transition-all group-hover:w-full"></span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-full bg-white/50 border border-white/60 text-primary-berry text-sm font-semibold hover:bg-white hover:shadow-sm transition"
                >
                  Hi, {user.name?.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-primary-berry font-medium transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-berry transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-full btn-gradient-vows text-sm font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
                >
                  Join Community
                </Link>
              </div>
            )}
            <button
              className="md:hidden p-2 border border-white/40 rounded-xl bg-white/30 text-gray-700 hover:bg-white hover:border-primary-berry transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl animate-fade-in">
          <div className="px-6 py-6 space-y-4">
            <Link to="/items" className="block text-lg font-medium text-gray-800 hover:text-primary-berry">
              Collections
            </Link>
            <Link to="/wishlist" className="block text-lg font-medium text-gray-800 hover:text-primary-berry">
              Wishlist
            </Link>
            <Link to="/profile" className="block text-lg font-medium text-gray-800 hover:text-primary-berry">
              Profile
            </Link>
            <div className="h-px bg-gray-100 my-2"></div>
            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left text-lg font-medium text-red-500 hover:text-red-600"
              >
                Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Link to="/login" className="text-center py-3 rounded-xl border border-gray-200 font-semibold text-gray-700">
                  Login
                </Link>
                <Link to="/register" className="text-center py-3 rounded-xl btn-gradient-vows text-white font-semibold shadow-lg">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
