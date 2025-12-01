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
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {item.images?.map((src) => (
              <img key={src} src={src} alt={item.title} className="rounded-lg object-cover w-full h-64" />
            ))}
          </div>
          <h2 className="text-3xl font-semibold mt-4">{item.title}</h2>
          <p className="text-gray-600">{item.description}</p>
          <div className="mt-4 flex gap-6 text-lg font-semibold">
            <span>Rent: ₹{item.rentPricePerDay}/day</span>
            {item.salePrice && <span>Buy: ₹{item.salePrice}</span>}
          </div>
          <p className="text-sm text-gray-500 mt-2">Deposit: ₹{item.depositAmount}</p>
          <p className="text-sm text-gray-500">Location: {item.location?.city}, {item.location?.pincode}</p>
          <div className="mt-4">
            <h4 className="font-semibold">Owner</h4>
            <p className="text-gray-600">{item.ownerId?.name} • {item.ownerId?.email}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h3 className="text-xl font-semibold">Reviews</h3>
          <ReviewList reviews={reviews} />
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                  aria-label={`${star} star`}
                >
                  <StarIcon
                    className={`w-6 h-6 ${
                      star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm text-gray-600 ml-2">{rating} / 5</span>
            </div>
            <div className="flex gap-2">
              <input
                name="comment"
                placeholder="Leave a short comment"
                className="flex-1 border rounded px-3 py-2"
              />
              <button type="submit" className="bg-brand text-white px-4 py-2 rounded">
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      <aside className="bg-white rounded-lg shadow p-4 space-y-4">
        <h3 className="text-xl font-semibold">Select Rental Dates</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        {availability && (
          <p className={`text-sm font-semibold ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
            {availability.available ? 'Available ✔' : 'Unavailable ✘'}
            {!availability.available && (
              <span className="block text-xs text-gray-500">
                Conflicts: {availability.conflictingBookings?.length || 0}
              </span>
            )}
          </p>
        )}
        <button
          onClick={handleAvailability}
          className="w-full bg-gray-200 py-2 rounded text-sm font-semibold"
          disabled={checking}
        >
          {checking ? 'Checking...' : 'Check Availability'}
        </button>
        <button
          onClick={handleRentNow}
          className="w-full bg-brand text-white py-2 rounded text-sm font-semibold"
        >
          Rent Now
        </button>
        <button
          onClick={handleBuyNow}
          className="w-full border border-brand text-brand py-2 rounded text-sm font-semibold"
        >
          Buy Now
        </button>
        {startDate && endDate && (
          <p className="text-sm text-gray-500">
            Selected: {format(startDate, 'MMM dd')} → {format(endDate, 'MMM dd')}
          </p>
        )}
      </aside>
    </div>
  );
};

export default ItemDetailPage;


