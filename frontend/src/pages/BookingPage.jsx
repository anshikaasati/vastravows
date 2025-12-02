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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary-berry p-6 text-white">
          <h2 className="text-2xl font-bold">
            {step === 1 ? 'Booking Details' : 'Payment & Confirmation'}
          </h2>
          <p className="opacity-90 text-sm mt-1">
            {isRental ? `Rent: ${item.title}` : `Buy: ${item.title}`}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Progress Indicator */}
          <div className="flex items-center mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary-berry text-white' : 'bg-gray-200'} font-bold`}>1</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary-berry' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary-berry text-white' : 'bg-gray-200'} font-bold`}>2</div>
          </div>

          {step === 1 ? (
            /* STEP 1: DETAILS FORM */
            <form onSubmit={handleNextStep} className="space-y-6">
              {/* Personal Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                  <User className="w-5 h-5 mr-2 text-primary-berry" /> Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="renterName"
                      value={formData.renterName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-primary-berry focus:border-primary-berry"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-primary-berry focus:border-primary-berry"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                  <Truck className="w-5 h-5 mr-2 text-primary-berry" /> Item Preferences
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {/* Assuming item.size is a string like "S, M, L" or just "M" */}
                    {/* If item.size is an array in backend but string in frontend form, let's handle it safely */}
                    {(typeof item.size === 'string' ? item.size.split(',') : (Array.isArray(item.size) ? item.size : [item.size])).map((s) => {
                      const sizeVal = s.trim();
                      return (
                        <label key={sizeVal} className={`cursor-pointer px-4 py-2 rounded-lg border transition ${formData.size === sizeVal ? 'bg-primary-berry text-white border-primary-berry' : 'bg-white hover:bg-gray-100 border-gray-300'}`}>
                          <input
                            type="radio"
                            name="size"
                            value={sizeVal}
                            checked={formData.size === sizeVal}
                            onChange={handleInputChange}
                            className="hidden"
                          />
                          {sizeVal}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                  <MapPin className="w-5 h-5 mr-2 text-primary-berry" /> Delivery Location
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                    <textarea
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full p-2 border rounded-lg focus:ring-primary-berry focus:border-primary-berry"
                      placeholder="House No, Street, Area"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-primary-berry focus:border-primary-berry"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-primary-berry focus:border-primary-berry"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Specific: Pickup Address */}
              {isRental && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                    <Truck className="w-5 h-5 mr-2 text-primary-berry" /> Return Pickup
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address (for return)</label>
                    <textarea
                      name="pickupAddress"
                      value={formData.pickupAddress}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full p-2 border rounded-lg focus:ring-primary-berry focus:border-primary-berry"
                      placeholder="Same as delivery or different?"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary-berry text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition"
              >
                Proceed to Payment
              </button>
            </form>
          ) : (
            /* STEP 2: PAYMENT */
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Item</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {isRental && (
                    <>
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span>{days} Days ({format(new Date(startDate), 'MMM d')} - {format(new Date(endDate), 'MMM d')})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rent (₹{item.rentPricePerDay}/day)</span>
                        <span>₹{rentAmount}</span>
                      </div>
                      <div className="flex justify-between text-orange-600">
                        <span>Security Deposit (Refundable)</span>
                        <span>₹{depositAmount}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold text-primary-berry">
                    <span>Total Payable</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-6">
                <h3 className="font-bold text-lg">Payment Method</h3>

                {isRental ? (
                  <>
                    {/* Deposit Payment - Enforce Online */}
                    <div className="border rounded-xl p-4 bg-orange-50 border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                        <Banknote className="w-4 h-4 mr-2" /> Security Deposit (₹{depositAmount})
                      </h4>
                      <p className="text-xs text-orange-700 mb-3">Must be paid online via Bank, Card, or UPI.</p>
                      <div className="flex gap-4">
                        {['card', 'upi', 'netbanking'].map(method => (
                          <label key={method} className={`flex-1 cursor-pointer p-3 rounded-lg border text-center capitalize transition ${formData.depositPaymentMethod === method ? 'bg-white border-orange-500 shadow-sm ring-1 ring-orange-500' : 'bg-white/50 border-gray-300'}`}>
                            <input
                              type="radio"
                              name="depositPaymentMethod"
                              value={method}
                              checked={formData.depositPaymentMethod === method}
                              onChange={handleInputChange}
                              className="hidden"
                            />
                            {method === 'netbanking' ? 'Net Banking' : method}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Rent Payment - COD or Online */}
                    <div className="border rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" /> Rent Amount (₹{rentAmount})
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">Can be paid via COD or Online.</p>
                      <div className="flex gap-4">
                        {['cod', 'online'].map(method => (
                          <label key={method} className={`flex-1 cursor-pointer p-3 rounded-lg border text-center capitalize transition ${formData.rentPaymentMethod === method ? 'bg-primary-berry text-white border-primary-berry' : 'bg-white hover:bg-gray-50 border-gray-300'}`}>
                            <input
                              type="radio"
                              name="rentPaymentMethod"
                              value={method}
                              checked={formData.rentPaymentMethod === method}
                              onChange={handleInputChange}
                              className="hidden"
                            />
                            {method === 'cod' ? 'Cash on Delivery' : 'Pay Online'}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Sale Payment - Standard */
                  <div className="border rounded-xl p-4">
                    <div className="flex gap-4">
                      {['cod', 'card', 'upi'].map(method => (
                        <label key={method} className={`flex-1 cursor-pointer p-3 rounded-lg border text-center capitalize transition ${formData.paymentMethod === method ? 'bg-primary-berry text-white border-primary-berry' : 'bg-white hover:bg-gray-100 border-gray-300'}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={formData.paymentMethod === method}
                            onChange={handleInputChange}
                            className="hidden"
                          />
                          {method === 'cod' ? 'Cash on Delivery' : method}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="flex-1 py-3 bg-primary-berry text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay ₹${totalAmount} & Book`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
