import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingApi, paymentApi } from '../api/services';
import { useCart } from '../context/CartContext';
import { MapPin, Truck, User, Phone, Calendar, CreditCard, Banknote, Map as MapIcon } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const BookingPage = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/items');
    }
  }, [cart, navigate]);

  const [formData, setFormData] = useState({
    renterName: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    deliveryAddress: '',
    city: '',
    pincode: '',
    pickupAddress: '',
    deliveryDate: '', // Global preference
    returnDate: '',   // Global preference
    paymentMethod: 'online', // Default
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Getting location...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          toast.dismiss();
          const { latitude, longitude } = position.coords;
          // In a real app, use Geocoding API here to get address from lat/lng
          // For now, we'll just fill a placeholder and show success
          setFormData(prev => ({
            ...prev,
            deliveryAddress: `Lat: ${latitude}, Long: ${longitude} (Pinned Location)`,
            // city: 'Detected City',
            // pincode: 'Detected Pin'
          }));
          toast.success('Location pinned successfully!');
          setShowMapModal(false);
        },
        (error) => {
          toast.dismiss();
          toast.error('Unable to retrieve location');
          console.error(error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.renterName || !formData.phoneNumber || !formData.deliveryAddress || !formData.city || !formData.pincode) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setStep(2);
  };

  const calculateBreakdown = () => {
    let rentTotal = 0;
    let depositTotal = 0;
    let saleTotal = 0;

    cart.forEach(item => {
      if (item.rentPricePerDay && item.rentalPeriod) {
        const days = Math.ceil((new Date(item.rentalPeriod.endDate) - new Date(item.rentalPeriod.startDate)) / (1000 * 60 * 60 * 24));
        rentTotal += item.rentPricePerDay * days;
        depositTotal += (item.depositAmount || 0);
      } else {
        saleTotal += (item.salePrice || 0);
      }
    });

    const platformFee = 50; // Fixed fee for example
    const deliveryCharges = 100; // Fixed delivery
    const gst = (rentTotal + saleTotal) * 0.18; // 18% GST on services/goods
    const subTotal = rentTotal + depositTotal + saleTotal;
    const grandTotal = subTotal + platformFee + deliveryCharges + gst;

    return { rentTotal, depositTotal, saleTotal, platformFee, deliveryCharges, gst, grandTotal };
  };

  const breakdown = calculateBreakdown();

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      // Calculate amounts
      // Mandatory Online: Deposit + Platform Fee + Delivery Charges
      const mandatoryOnlineAmount = breakdown.depositTotal + breakdown.platformFee + breakdown.deliveryCharges;

      // Payable Amount: Grand Total (if Online) OR Mandatory Amount (if COD)
      const payableAmount = formData.paymentMethod === 'online' ? breakdown.grandTotal : mandatoryOnlineAmount;

      // Create Razorpay Order
      const { data: order } = await paymentApi.createOrder({ amount: payableAmount, currency: 'INR' });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vastra Vows",
        description: formData.paymentMethod === 'online' ? "Full Payment" : "Partial Payment (Booking Charges)",
        image: "https://i.imgur.com/3g7nmJC.png",
        order_id: order.id,
        handler: async function (response) {
          try {
            // Create bookings for each item
            for (let i = 0; i < cart.length; i++) {
              const item = cart[i];
              const isFirst = i === 0;

              const isRental = !!item.rentPricePerDay;
              const days = isRental ? Math.ceil((new Date(item.rentalPeriod.endDate) - new Date(item.rentalPeriod.startDate)) / (1000 * 60 * 60 * 24)) : 0;
              const itemRentAmount = isRental ? item.rentPricePerDay * days : 0;
              const itemSaleAmount = !isRental ? item.salePrice : 0;
              const itemDeposit = item.depositAmount || 0;

              // GST is calculated on Rent + Sale (Service/Goods)
              const itemGST = (itemRentAmount + itemSaleAmount) * 0.18;

              // Calculate Paid and Due Amounts
              let paidAmount = 0;
              let dueAmount = 0;

              if (formData.paymentMethod === 'online') {
                // Full Payment Online
                paidAmount = itemRentAmount + itemSaleAmount + itemDeposit + itemGST;
                if (isFirst) {
                  paidAmount += breakdown.platformFee + breakdown.deliveryCharges;
                }
                dueAmount = 0;
              } else {
                // Partial Payment (COD)
                // Online: Deposit + Fees (if first)
                paidAmount = itemDeposit;
                if (isFirst) {
                  paidAmount += breakdown.platformFee + breakdown.deliveryCharges;
                }

                // Due (COD): Rent + Sale + GST
                dueAmount = itemRentAmount + itemSaleAmount + itemGST;
              }

              const payload = {
                itemId: item._id,
                startDate: item.rentalPeriod?.startDate,
                endDate: item.rentalPeriod?.endDate,
                renterName: formData.renterName,
                phoneNumber: formData.phoneNumber,
                size: item.selectedSize,
                deliveryAddress: formData.deliveryAddress,
                pickupAddress: formData.pickupAddress || formData.deliveryAddress,
                location: {
                  city: formData.city,
                  pincode: formData.pincode
                },
                depositAmount: itemDeposit,
                rentAmount: itemRentAmount,
                paymentMethod: formData.paymentMethod,
                // New fields
                platformFee: isFirst ? breakdown.platformFee : 0,
                deliveryCharges: isFirst ? breakdown.deliveryCharges : 0,
                gst: itemGST,
                paidAmount: paidAmount,
                dueAmount: dueAmount,

                alternatePhoneNumber: formData.alternatePhoneNumber,
                deliveryDate: formData.deliveryDate,
                returnDate: formData.returnDate
              };

              await paymentApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: payload
              });
            }

            toast.success('Order placed successfully!');
            clearCart();
            navigate('/bookings');
          } catch (err) {
            console.error(err);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: formData.renterName,
          contact: formData.phoneNumber
        },
        theme: {
          color: "#D4AF37"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Stepper */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-center justify-center relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10" />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? 'bg-primary-berry text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`w-32 h-0.5 mx-4 ${step >= 2 ? 'bg-primary-berry' : 'bg-gray-200'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? 'bg-primary-berry text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>
        <div className="flex justify-center gap-28 mt-2 text-sm font-semibold text-gray-600">
          <span>Details</span>
          <span>Summary & Pay</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Left Column: Form or Items */}
        <div className="space-y-6">
          {step === 1 ? (
            <div className="glass-panel p-6 rounded-3xl animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Buyer Details</h2>
              <form id="booking-form" onSubmit={handleNextStep} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required name="renterName" value={formData.renterName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-input" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-input" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone (Optional)</label>
                    <input name="alternatePhoneNumber" value={formData.alternatePhoneNumber} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-input" placeholder="Backup number" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Delivery Date</label>
                    <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Return Date</label>
                    <input type="date" name="returnDate" value={formData.returnDate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-input" />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                    <button type="button" onClick={() => setShowMapModal(true)} className="text-sm text-primary-berry font-semibold flex items-center gap-1 hover:underline">
                      <MapIcon className="w-4 h-4" /> Pin on Map
                    </button>
                  </div>
                  <textarea required name="deliveryAddress" value={formData.deliveryAddress} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 rounded-xl glass-input" placeholder="Full address" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-input" placeholder="City" />
                    <input required name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-input" placeholder="Pincode" />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg mt-6">
                  Continue to Summary
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-3xl animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Review Items</h2>
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-white/50 rounded-xl border border-gray-100">
                    <img src={item.images?.[0]} alt={item.title} className="w-20 h-20 rounded-lg object-cover" />
                    <div>
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                      {item.rentalPeriod && (
                        <p className="text-xs text-gray-500">
                          {new Date(item.rentalPeriod.startDate).toLocaleDateString()} - {new Date(item.rentalPeriod.endDate).toLocaleDateString()}
                        </p>
                      )}
                      <p className="font-semibold mt-1">
                        {item.salePrice ? `₹${item.salePrice}` : `₹${item.rentPricePerDay}/day`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="mt-6 text-gray-500 hover:text-gray-900 font-medium">
                ← Edit Details
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Summary & Pay */}
        <div className="h-fit space-y-6">
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Rental Charges</span>
                <span>₹{breakdown.rentTotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Security Deposits (Refundable)</span>
                <span>₹{breakdown.depositTotal}</span>
              </div>
              {breakdown.saleTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Purchase Total</span>
                  <span>₹{breakdown.saleTotal}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span>₹{breakdown.platformFee}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span>₹{breakdown.deliveryCharges}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{breakdown.gst.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 my-2" />

              <div className="flex justify-between text-xl font-bold text-primary-berry">
                <span>Grand Total</span>
                <span>₹{breakdown.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {step === 2 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Payment Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${formData.paymentMethod === 'online' ? 'border-primary-berry bg-primary-berry/5' : 'border-transparent bg-white/50'}`}>
                    <input type="radio" name="paymentMethod" value="online" checked={formData.paymentMethod === 'online'} onChange={handleInputChange} className="hidden" />
                    <span className="font-semibold block text-sm">Online Pay</span>
                  </label>
                  <label className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${formData.paymentMethod === 'cod' ? 'border-primary-berry bg-primary-berry/5' : 'border-transparent bg-white/50'}`}>
                    <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="hidden" />
                    <span className="font-semibold block text-sm">Cash on Delivery</span>
                  </label>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="w-full py-4 rounded-xl btn-gradient-vows font-bold text-white shadow-lg disabled:opacity-70"
                >
                  {loading ? 'Processing...' : `Pay ₹${breakdown.grandTotal.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full animate-fade-in shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pin Delivery Location</h3>
            <LocationPicker
              onClose={() => setShowMapModal(false)}
              onLocationSelect={(locationData) => {
                setFormData(prev => ({
                  ...prev,
                  deliveryAddress: locationData.address,
                  city: locationData.city,
                  pincode: locationData.pincode
                }));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
