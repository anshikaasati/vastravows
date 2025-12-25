import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { itemApi, bookingApi, reviewApi } from '../api/services';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewList from '../components/ReviewList';
import { Star as StarIcon, ShoppingBag, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

const ItemDetailPage = () => {
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 1));
  const [rating, setRating] = useState(5);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Lightbox & Carousel State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await itemApi.getById(id);
        setItem(data.item);
        setReviews(data.reviews);
      } catch (error) {
        toast.error('Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // Carousel Handlers
  const nextImage = (e) => {
    e?.stopPropagation();
    if (item?.images?.length) {
      setSelectedImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    if (item?.images?.length) {
      setSelectedImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setZoomLevel(prev => prev === 1 ? 2 : 1);
  };

  const handleAvailability = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    setChecking(true);
    try {
      const payload = {
        itemId: id,
        startDate: startDate,
        endDate: endDate
      };
      const { data } = await bookingApi.check(payload);
      setAvailability(data);
      if (data.available) {
        toast.success('Item is available for these dates');
      } else {
        toast.error('Those dates are already booked');
      }
    } catch (error) {
      toast.error('Unable to check availability');
    } finally {
      setChecking(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!item.salePrice && !availability?.available) {
      toast.error('Please check availability first');
      return;
    }

    addToCart(item, selectedSize, item.salePrice ? null : { startDate, endDate });
  };

  const handleRentNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!availability?.available) {
      toast.error('Please check availability first');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    // Add to cart first then navigate
    addToCart(item, selectedSize, { startDate, endDate });
    navigate('/booking');
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!item.salePrice) {
      toast.error('This item is not for sale');
      return;
    }
    addToCart(item, selectedSize, null);
    navigate('/booking');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const comment = formData.get('comment');
    try {
      const { data } = await reviewApi.create({ itemId: id, rating, comment });
      setReviews((prev) => [data, ...prev]);
      e.currentTarget.reset();
      toast.success('Review added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!item) return <p>Item not found.</p>;

  return (
    <div className="flex flex-col lg:grid lg:gap-6 lg:grid-cols-[1.5fr_1fr] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 gap-6">
      <div className="space-y-6 md:space-y-8 order-1">
        {/* Main Content Card */}
        <div className="glass-panel rounded-xl p-4 md:p-8 animate-fade-in">
          {/* Image Gallery */}
          {/* Image Gallery - Carousel */}
          <div className="space-y-4">
            <div
              className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg relative group bg-gray-100"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEndHandler}
            >
              <img
                src={item.images?.[selectedImageIndex] || item.images?.[0]}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Navigation Arrows */}
              {item.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {item.images?.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {item.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }}
                      className={`h-2 rounded-full transition-all duration-300 ${selectedImageIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 md:mt-8 space-y-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-medium text-gray-900 mb-2">{item.title}</h2>
              <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-gray-500 font-bold">
                {item.gender} • {item.subcategory?.replace(/-/g, ' ')}
              </p>
            </div>

            <div className="flex items-baseline gap-4 border-b border-gray-200 pb-6">
              {item.salePrice ? (
                <span className="text-3xl md:text-4xl font-display font-medium text-gray-900">₹{item.salePrice}</span>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-display font-medium text-primary">₹{item.rentPricePerDay}</span>
                  <span className="text-gray-500 font-medium font-sans">/ day</span>
                </div>
              )}
            </div>

            {/* Size Selection */}
            <div className="py-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-900 mb-4">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {(() => {
                  // Parse size: handle array or string
                  let sizes = [];
                  if (Array.isArray(item.size)) {
                    sizes = item.size;
                  } else if (typeof item.size === 'string') {
                    sizes = item.size.split(',').map(s => s.trim()).filter(s => s);
                  }

                  if (sizes.length > 0) {
                    return sizes.map((size) => {
                      const isInCart = cart.some(cartItem => cartItem._id === item._id && cartItem.selectedSize === size);
                      return (
                        <button
                          key={size}
                          onClick={() => !isInCart && setSelectedSize(size)}
                          disabled={isInCart}
                          className={`w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-semibold transition-all duration-300 ${selectedSize === size
                            ? 'border-primary bg-primary text-white shadow-lg'
                            : isInCart
                              ? 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                            }`}
                          title={isInCart ? 'Already in cart' : size}
                        >
                          {size}
                        </button>
                      );
                    });
                  } else {
                    return <p className="text-sm text-gray-500">No sizes available</p>;
                  }
                })()}
              </div>
            </div>
            <div className="prose prose-pink max-w-none text-gray-600 leading-relaxed text-sm md:text-base">
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">Description</h3>
              <p>{item.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-t border-gray-200">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Location</p>
                <p className="font-medium text-gray-900">{item.location?.city}, {item.location?.pincode}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Security Deposit</p>
                <p className="font-medium text-gray-900">₹{item.depositAmount}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-white/60">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md">
                {item.ownerId?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-0.5">Listed by</p>
                <p className="font-display font-semibold text-gray-900 text-sm md:text-lg">{item.ownerId?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Order 3 on mobile (appears after sidebar) */}
        <div className="glass-panel rounded-xl p-4 md:p-8 order-3 lg:order-2">
          <h3 className="text-2xl font-display font-medium mb-8">Client Reviews</h3>
          <ReviewList reviews={reviews} />

          <div className="mt-8 pt-8 border-t border-gray-200/60">
            <h4 className="text-lg font-display font-medium mb-4">Write a Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <StarIcon
                      className={`w-6 h-6 md:w-8 md:h-8 ${star <= rating ? 'text-primary fill-primary' : 'text-gray-200'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  name="comment"
                  placeholder="Share your experience with this attire..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-1 focus:ring-primary focus:border-primary text-sm md:text-base outline-none"
                />
                <button type="submit" className="px-8 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-all duration-300 shadow-lg w-full sm:w-auto">
                  POST
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sidebar - Order 2 on mobile (appears before reviews) */}
      <div className="lg:sticky lg:top-24 h-fit space-y-6 order-2 lg:order-3">
        <div className="glass-card rounded-xl p-6 md:p-8 border border-white/60 shadow-xl">
          {!item.salePrice && <h3 className="text-xl font-display font-medium mb-6">Check Availability</h3>}

          <div className="space-y-6">
            {!item.salePrice && (
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-3">Rental Period</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 mb-1 block">Start Date</span>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      minDate={new Date()}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 mb-1 block">End Date</span>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {availability && !item.salePrice && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${availability.available ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                <div className={`w-2 h-2 rounded-xl ${availability.available ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-semibold text-sm">{availability.available ? 'Dates Available' : 'Dates Unavailable'}</p>
                  {!availability.available && (
                    <p className="text-xs opacity-80">Please select different dates</p>
                  )}
                </div>
              </div>
            )}

            {!item.salePrice && (
              <button
                onClick={handleAvailability}
                disabled={checking}
                className="w-full py-3 rounded-xl border border-gray-300 font-bold text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition"
              >
                {checking ? 'Checking...' : 'Check Availability'}
              </button>
            )}

            <div className="h-px bg-gray-100 my-2" />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 rounded-xl border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add Cart
              </button>

              {item.salePrice ? (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Buy Now
                </button>
              ) : (
                <button
                  onClick={handleRentNow}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Rent Now
                </button>
              )}
            </div>

            <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-wide">
              Secure transaction • 100% Money back guarantee
            </p>
          </div>
        </div>
      </div>
      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in">
          <button
            onClick={() => { setLightboxOpen(false); setZoomLevel(1); }}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-50"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-6xl flex items-center justify-between gap-4">
            {item.images?.length > 1 && (
              <button
                onClick={prevImage}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden md:block"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            <div
              className="relative flex-1 h-[80vh] flex items-center justify-center overflow-hidden"
              onClick={toggleZoom}
            >
              <img
                src={item.images?.[selectedImageIndex]}
                alt={item.title}
                style={{ transform: `scale(${zoomLevel})` }}
                className={`max-w-full max-h-full object-contain transition-transform duration-300 ${zoomLevel > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
              />
            </div>

            {item.images?.length > 1 && (
              <button
                onClick={nextImage}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden md:block"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white">
            <button
              onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(1, prev - 0.5)); }}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ZoomOut className="w-6 h-6" />
            </button>
            <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(3, prev + 0.5)); }}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ZoomIn className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailPage;


