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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 pb-12 pt-16 md:pt-24 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h2 className="text-5xl md:text-7xl font-script text-primary/90">My Bookings</h2>
          <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-[0.2em]">
            Manage your rentals & timeline
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {bookings.length === 0 ? (
          <div className="glass-panel p-16 text-center max-w-xl mx-auto rounded-[2rem] border border-white/60 shadow-xl">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-2xl font-display font-medium text-gray-900 mb-3">No bookings yet</h3>
            <p className="text-gray-500 font-light mb-8 max-w-xs mx-auto leading-relaxed">
              Your calendar is clear. Why not fill it with something beautiful?
            </p>
            <a href="/items" className="inline-block px-10 py-4 bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Explore Collection
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {bookings.map((booking) => (
              <div key={booking._id} className="group bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full">
                {/* Image Header */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                  <img
                    src={booking.itemId?.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
                    alt={booking.itemId?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/20 ${booking.status === 'confirmed' ? 'bg-green-500/90 text-white' :
                      booking.status === 'cancelled' ? 'bg-red-500/90 text-white' :
                        'bg-amber-400/90 text-white'
                      }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-display font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors" title={booking.itemId?.title}>
                    {booking.itemId?.title}
                  </h3>

                  <div className="mt-6 space-y-4 flex-1">
                    {/* Dates */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline border-b border-gray-50 pb-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Start</span>
                        <span className="font-display text-gray-700">{new Date(booking.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-gray-50 pb-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">End</span>
                        <span className="font-display text-gray-700">{new Date(booking.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-500 font-medium">Total Amount</span>
                      <span className="text-xl font-display font-medium text-primary">₹{booking.totalAmount}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="mt-6 w-full py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-xl transition-all duration-300 hover:bg-red-50"
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
    </div>
  );
};

export default UserBookingsPage;


