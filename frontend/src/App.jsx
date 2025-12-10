import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddItemPage from './pages/AddItemPage';
import ItemsPage from './pages/ItemsPage';
import ItemDetailPage from './pages/ItemDetailPage';
import CartPage from './pages/CartPage';
import BookingPage from './pages/BookingPage';
import UserBookingsPage from './pages/UserBookingsPage';
import OwnerItemsPage from './pages/OwnerItemsPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FAQPage from './pages/FAQPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/add-item"
          element={
            <ProtectedRoute>
              <AddItemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/edit/:id"
          element={
            <ProtectedRoute>
              <AddItemPage />
            </ProtectedRoute>
          }
        />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <UserBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-items"
          element={
            <ProtectedRoute>
              <OwnerItemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        {/* Footer Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);

export default App;


