import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h2 className="text-3xl font-display font-bold text-gray-900">My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500">Browse our collection and book your first look!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-6 animate-fade-in">
              <div className="w-full md:w-48 aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                <img
                  src={booking.itemId?.images?.[0]}
                  alt={booking.itemId?.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{booking.itemId?.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/50 p-3 rounded-lg border border-white/60">
                      <p className="text-xs text-gray-500 mb-1">Start Date</p>
                      <p className="font-semibold text-gray-900">{new Date(booking.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg border border-white/60">
                      <p className="text-xs text-gray-500 mb-1">End Date</p>
                      <p className="font-semibold text-gray-900">{new Date(booking.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                  <div className="text-sm">
                    <span className="text-gray-500">Total Amount: </span>
                    <span className="font-bold text-gray-900">₹{booking.totalAmount}</span>
                  </div>

                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;


