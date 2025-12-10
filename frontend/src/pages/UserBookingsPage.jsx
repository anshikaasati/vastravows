import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar } from 'lucide-react';

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingApi.listUser();
      setBookings(data);
    } catch (error) {
      toast.error('Unable to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    try {
      await bookingApi.cancel(id);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (error) {
      toast.error('Unable to cancel booking');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center justify-center text-center my-12 space-y-4">
        <h2 className="text-4xl md:text-5xl font-display font-medium text-primary italic">My Bookings</h2>
        <div className="w-16 h-1 bg-secondary mx-auto"></div>
        <p className="text-gray-500 max-w-lg mx-auto font-light">Track your upcoming elegance. Manage your rentals with ease.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-6">Browse our collection and book your first look!</p>
          <a href="/items" className="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Explore Collection
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {bookings.map((booking) => (
            <div key={booking._id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group bg-white hover:shadow-2xl transition-all duration-300 border border-gray-100">
              {/* Image Header */}
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <img
                  src={booking.itemId?.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
                  alt={booking.itemId?.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${booking.status === 'confirmed' ? 'bg-green-100/90 text-green-700' :
                      booking.status === 'cancelled' ? 'bg-red-100/90 text-red-700' :
                        'bg-yellow-100/90 text-yellow-700'
                    }`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={booking.itemId?.title}>
                  {booking.itemId?.title}
                </h3>

                <div className="mt-4 space-y-3 flex-1">
                  {/* Dates */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/50">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-500 uppercase tracking-wide">Start Date</span>
                      <span className="font-medium text-gray-900">{new Date(booking.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 uppercase tracking-wide">End Date</span>
                      <span className="font-medium text-gray-900">{new Date(booking.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-lg font-bold text-primary">₹{booking.totalAmount}</span>
                  </div>
                </div>

                {/* Actions */}
                {booking.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="mt-4 w-full py-2.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-white border border-red-200 hover:bg-red-500 rounded-lg transition-all duration-300"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;


