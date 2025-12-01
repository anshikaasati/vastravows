import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30">
      <div className="backdrop-blur-xl bg-white/80 border-b border-white/40 shadow-glow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-berry via-rose-500 to-secondary-gold text-white flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display text-xl tracking-wide text-primary-berry">Vastra Vows</p>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary-gold">
                Luxe Rentals
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <Link to="/items" className="hover:text-primary-berry transition">
              Collections
            </Link>
            <Link to="/wishlist" className="hover:text-primary-berry transition">
              Wishlist
            </Link>
            <Link to="/bookings" className="hover:text-primary-berry transition">
              Bookings
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-full bg-white/70 text-primary-berry text-sm font-semibold hover:bg-white"
                >
                  Hi, {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-primary-berry"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm text-gray-600 hover:text-primary-berry">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full btn-gradient-vows text-sm font-semibold"
                >
                  Join Community
                </Link>
              </div>
            )}
            <button
              className="md:hidden p-2 border border-white/40 rounded-2xl text-gray-700 hover:border-primary-berry transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link to="/items" className="block py-2 text-gray-700 hover:text-primary-berry">
              Collections
            </Link>
            <Link to="/wishlist" className="block py-2 text-gray-700 hover:text-primary-berry">
              Wishlist
            </Link>
            <Link to="/profile" className="block py-2 text-gray-700 hover:text-primary-berry">
              Profile
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-gray-700 hover:text-primary-berry"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700 hover:text-primary-berry">
                  Login
                </Link>
                <Link to="/register" className="block py-2 text-gray-700 hover:text-primary-berry">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
