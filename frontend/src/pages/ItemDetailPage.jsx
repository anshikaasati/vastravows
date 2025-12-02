import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { addDays, format } from 'date-fns';
import toast from 'react-hot-toast';
import { itemApi, bookingApi, reviewApi } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewList from '../components/ReviewList';
import { Star as StarIcon } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

const ItemDetailPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 1));
  const [rating, setRating] = useState(5);
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

  const handleRentNow = () => {
    if (!availability?.available) {
      toast.error('Please check availability first');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    navigate('/booking', {
      state: {
        item,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  };

  const handleBuyNow = () => {
    if (!item.salePrice) {
      toast.error('This item is not for sale');
      return;
    }
    toast.success('Buying flow would be implemented here');
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
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Main Content Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <img
                src={item.images?.[0]}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
              />
            </div>
            {item.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {item.images.slice(1).map((src, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary-berry transition">
                    <img src={src} alt={`View ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-2">{item.title}</h2>
              <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold">
                {item.gender} • {item.subcategory?.replace(/-/g, ' ')}
              </p>
            </div>

            <div className="flex items-baseline gap-4 border-b border-gray-200 pb-6">
              {item.salePrice ? (
                <span className="text-3xl font-bold text-gray-900">₹{item.salePrice}</span>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-berry">₹{item.rentPricePerDay}</span>
                  <span className="text-gray-500 font-medium">/ day</span>
                </div>
              )}
            </div>

            <div className="prose prose-pink max-w-none text-gray-600 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p>{item.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="font-medium text-gray-900">{item.location?.city}, {item.location?.pincode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Security Deposit</p>
                <p className="font-medium text-gray-900">₹{item.depositAmount}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-white/60">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-berry to-secondary-gold flex items-center justify-center text-white font-bold text-xl">
                {item.ownerId?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Listed by</p>
                <p className="font-semibold text-gray-900">{item.ownerId?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="glass-panel rounded-3xl p-6 md:p-8">
          <h3 className="text-2xl font-display font-bold mb-6">Client Reviews</h3>
          <ReviewList reviews={reviews} />

          <div className="mt-8 pt-8 border-t border-gray-200/60">
            <h4 className="text-lg font-semibold mb-4">Write a Review</h4>
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
                      className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  name="comment"
                  placeholder="Share your experience with this attire..."
                  className="flex-1 px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary-berry/20"
                />
                <button type="submit" className="px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition shadow-lg">
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:sticky lg:top-24 h-fit space-y-6">
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/60 shadow-xl">
          <h3 className="text-xl font-display font-bold mb-6">Check Availability</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rental Period</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-500 mb-1 block">Start Date</span>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    className="w-full px-3 py-2 rounded-lg glass-input text-sm"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500 mb-1 block">End Date</span>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    className="w-full px-3 py-2 rounded-lg glass-input text-sm"
                  />
                </div>
              </div>
            </div>

            {availability && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${availability.available ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                <div className={`w-2 h-2 rounded-full ${availability.available ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-semibold text-sm">{availability.available ? 'Dates Available' : 'Dates Unavailable'}</p>
                  {!availability.available && (
                    <p className="text-xs opacity-80">Please select different dates</p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleAvailability}
              disabled={checking}
              className="w-full py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              {checking ? 'Checking...' : 'Check Availability'}
            </button>

            <div className="h-px bg-gray-200 my-4" />

            <button
              onClick={handleRentNow}
              className="w-full py-4 rounded-xl btn-gradient-vows font-bold text-white shadow-lg text-lg"
            >
              Rent Now
            </button>

            {item.salePrice && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3 rounded-xl btn-gradient-outline font-semibold"
              >
                Buy This Look
              </button>
            )}

            <p className="text-xs text-center text-gray-400 mt-4">
              Secure transaction • 100% Money back guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;


