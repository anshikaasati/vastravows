import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { bookingApi } from '../api/services';
import { MapPin, Truck, User, Phone, Calendar, CreditCard, Banknote } from 'lucide-react';

const BookingPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // If no item state, redirect back
  if (!state?.item) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">No item selected. Please go back.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 underline">Go Home</button>
      </div>
    );
  }

  const { item, startDate, endDate } = state;
  const isRental = item.rentPricePerDay > 0 && startDate && endDate;

  // Calculate amounts
  const days = isRental ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 0;
  const rentAmount = isRental ? item.rentPricePerDay * days : 0;
  const depositAmount = isRental ? (item.depositAmount || 0) : 0;
  const salePrice = item.salePrice || 0;
  const totalAmount = isRental ? (rentAmount + depositAmount) : salePrice;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    renterName: '',
    phoneNumber: '',
    size: '',
    deliveryAddress: '',
    city: '',
    pincode: '',
    pickupAddress: '', // For rental return/pickup
    paymentMethod: 'card', // Default for Sale
    depositPaymentMethod: 'card', // Default for Deposit (Online)
    rentPaymentMethod: 'cod', // Default for Rent (COD allowed)
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.renterName || !formData.phoneNumber || !formData.deliveryAddress || !formData.city || !formData.pincode || !formData.size) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (isRental && !formData.pickupAddress) {
      toast.error('Please provide a pickup address for the item return.');
      return;
    }
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const payload = {
        itemId: item._id,
        startDate,
        endDate,
        totalAmount,
        renterName: formData.renterName,
        phoneNumber: formData.phoneNumber,
        size: formData.size,
        deliveryAddress: formData.deliveryAddress,
        pickupAddress: formData.pickupAddress,
        location: {
          city: formData.city,
          pincode: formData.pincode
        },
        depositAmount,
        rentAmount,
        // Payment methods
        ...(isRental ? {
          depositPaymentMethod: formData.depositPaymentMethod,
          rentPaymentMethod: formData.rentPaymentMethod
        } : {
          paymentMethod: formData.paymentMethod
        })
      };

      await bookingApi.create(payload);
      toast.success('Booking confirmed successfully!');
      navigate('/bookings');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Visual Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-center relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10" />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${step >= 1 ? 'bg-primary-berry text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'
            }`}>1</div>
          <div className={`w-32 h-0.5 mx-4 transition-all duration-500 ${step >= 2 ? 'bg-primary-berry' : 'bg-gray-200'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${step >= 2 ? 'bg-primary-berry text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'
            }`}>2</div>
        </div>
        <div className="flex justify-center gap-32 mt-2 text-sm font-semibold text-gray-600">
          <span>Details</span>
          <span>Payment</span>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-8 animate-fade-in">
        <h2 className="text-3xl font-display font-bold text-center mb-8 text-gray-900">
          {step === 1 ? 'Booking Details' : 'Confirm & Pay'}
        </h2>

        {step === 1 && (
          <form id="booking-form" onSubmit={handleNextStep} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  name="renterName"
                  value={formData.renterName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary-berry/20"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  required
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary-berry/20"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size / Measurements</label>
              <input
                required
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary-berry/20"
                placeholder="e.g., M, L, or specific measurements"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Delivery Address</h3>
              <textarea
                required
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary-berry/20"
                placeholder="Full delivery address"
              />
              <div className="grid grid-cols-2 gap-6">
                <input
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary-berry/20"
                  placeholder="City"
                />
                <input
                  required
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary-berry/20"
                  placeholder="Pincode"
                />
              </div>
            </div>

            {isRental && (
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <label className="block text-sm font-medium text-amber-900 mb-1">Pickup Address (Return)</label>
                <textarea
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border-amber-200 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Same as delivery address if left empty"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg hover:bg-gray-800 transition shadow-lg mt-8"
            >
              Continue to Payment
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white/40 rounded-2xl p-6 border border-white/60">
              <div className="flex gap-4 mb-6">
                <img src={item.images?.[0]} alt={item.title} className="w-24 h-24 rounded-lg object-cover shadow-sm" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {isRental ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 'Purchase'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {isRental ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rent Amount ({days} days)</span>
                      <span className="font-medium">₹{rentAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit (Refundable)</span>
                      <span className="font-medium">₹{depositAmount}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sale Price</span>
                    <span className="font-medium">₹{item.salePrice}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 my-2" />
                <div className="flex justify-between text-lg font-bold text-primary-berry">
                  <span>Total Payable</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-6">
              {isRental ? (
                <>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Security Deposit (₹{depositAmount})
                    </h4>
                    <div className="p-4 border border-green-200 bg-green-50/50 rounded-xl flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span className="font-medium text-green-800">Online Payment Required</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Banknote className="w-4 h-4" /> Rent Amount (₹{rentAmount})
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.rentPaymentMethod === 'online' ? 'border-primary-berry bg-primary-berry/5' : 'border-transparent bg-white/50 hover:bg-white'
                        }`}>
                        <input
                          type="radio"
                          name="rentPaymentMethod"
                          value="online"
                          checked={formData.rentPaymentMethod === 'online'}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span className="font-semibold block">Pay Online</span>
                        <span className="text-xs text-gray-500">UPI / Cards</span>
                      </label>
                      <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.rentPaymentMethod === 'cod' ? 'border-primary-berry bg-primary-berry/5' : 'border-transparent bg-white/50 hover:bg-white'
                        }`}>
                        <input
                          type="radio"
                          name="rentPaymentMethod"
                          value="cod"
                          checked={formData.rentPaymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span className="font-semibold block">Cash on Delivery</span>
                        <span className="text-xs text-gray-500">Pay at doorstep</span>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === 'online' ? 'border-primary-berry bg-primary-berry/5' : 'border-transparent bg-white/50 hover:bg-white'
                      }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={formData.paymentMethod === 'online'}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <span className="font-semibold block">Pay Online</span>
                    </label>
                    <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === 'cod' ? 'border-primary-berry bg-primary-berry/5' : 'border-transparent bg-white/50 hover:bg-white'
                      }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <span className="font-semibold block">Cash on Delivery</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="flex-[2] py-4 rounded-xl btn-gradient-vows font-bold text-white shadow-lg disabled:opacity-70"
              >
                {loading ? 'Processing...' : `Pay ₹${totalAmount}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
