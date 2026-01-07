import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner'; // Ensure this exists or use a simple fallback
import ProtectedRoute from './components/ProtectedRoute';

// Lazy Load Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const AddItemPage = lazy(() => import('./pages/AddItemPage'));
const ItemsPage = lazy(() => import('./pages/ItemsPage'));
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const UserBookingsPage = lazy(() => import('./pages/UserBookingsPage'));
const OwnerItemsPage = lazy(() => import('./pages/OwnerItemsPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

const App = () => (
  <BrowserRouter>
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
            path="/booking"
            element={<BookingPage />}
          />
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
      </Suspense>
    </Layout>
  </BrowserRouter>
);

export default App;


