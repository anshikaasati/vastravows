import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingApi, paymentApi } from '../api/services';
import { useCart } from '../context/CartContext';
import { MapPin, Truck, User, Phone, Calendar, CreditCard, Banknote } from 'lucide-react';

const BookingPage = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);


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

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#fcf8f9] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4 px-4">
          <span className="text-primary font-bold tracking-widest uppercase text-xs">Final Step</span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-script text-primary/90 mb-4 sm:mb-6">Complete Your Booking</h1>
          {/* Stepper */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold tracking-widest uppercase">
            <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-colors ${step === 1 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200'
              }`}>
              01. Details
            </span>
            <div className="w-8 sm:w-12 h-px bg-gray-200"></div>
            <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-colors ${step === 2 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200'
              }`}>
              02. Payment
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 sm:gap-8">
          {/* Left Column: Form or Items */}
          <div className="space-y-8">
            {step === 1 ? (
              <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl border border-gray-100 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                <h2 className="text-xl sm:text-2xl font-display font-medium text-gray-900 mb-6 sm:mb-8 relative z-10">Buyer Details</h2>
                <form id="booking-form" onSubmit={handleNextStep} className="space-y-5 sm:space-y-6 relative z-10">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                      <input required name="renterName" value={formData.renterName} onChange={handleInputChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                      <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400" placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alternate Phone (Optional)</label>
                      <input name="alternatePhoneNumber" value={formData.alternatePhoneNumber} onChange={handleInputChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400" placeholder="Backup number" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Delivery Date</label>
                      <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Return Date</label>
                      <input type="date" name="returnDate" value={formData.returnDate} onChange={handleInputChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-gray-600" />
                    </div>
                  </div>

                  <div className="space-y-5 sm:space-y-6 pt-4 sm:pt-6 border-t border-gray-100">
                    <h3 className="text-lg sm:text-xl font-display font-medium text-gray-900">Delivery Address</h3>
                    <textarea required name="deliveryAddress" value={formData.deliveryAddress} onChange={handleInputChange} rows="3" className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400 resize-none text-sm sm:text-base" placeholder="Full address" />
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400" placeholder="City" />
                      <input required name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400" placeholder="Pincode" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 mt-4">
                    Continue to Payment
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl border border-gray-100 animate-fade-in">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-display font-medium text-gray-900">Review Items</h2>
                  <button onClick={() => setStep(1)} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
                    ← Edit Details
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <img src={item.images?.[0]} alt={item.title} className="w-full sm:w-24 h-48 sm:h-24 rounded-xl object-cover bg-white" />
                      <div className="flex-1">
                        <h3 className="text-lg font-display font-medium text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Size: {item.selectedSize}</p>

                        {item.rentalPeriod && (
                          <div className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-lg mb-2">
                            <p className="text-xs text-gray-600 font-medium">
                              {new Date(item.rentalPeriod.startDate).toLocaleDateString()} - {new Date(item.rentalPeriod.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <p className="text-xl font-display font-medium text-primary mt-1">
                          {item.salePrice ? `₹${item.salePrice}` : `₹${item.rentPricePerDay}/day`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Summary & Pay */}
          <div className="h-fit space-y-6 sm:space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-100 lg:sticky lg:top-24">
              <h3 className="text-xl sm:text-2xl font-display font-medium text-gray-900 mb-6 sm:mb-8 pb-4 border-b border-gray-100">Order Summary</h3>

              <div className="space-y-4 text-sm mb-8 text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Rental Charges</span>
                  <span className="font-bold text-gray-900">₹{breakdown.rentTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Security Deposits (Refundable)</span>
                  <span className="font-bold text-gray-900">₹{breakdown.depositTotal}</span>
                </div>
                {breakdown.saleTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium">Purchase Total</span>
                    <span className="font-bold text-gray-900">₹{breakdown.saleTotal}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Platform Fee</span>
                  <span className="font-bold text-gray-900">₹{breakdown.platformFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Delivery Charges</span>
                  <span className="font-bold text-gray-900">₹{breakdown.deliveryCharges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">GST (18%)</span>
                  <span className="font-bold text-gray-900">₹{breakdown.gst.toFixed(2)}</span>
                </div>

                <div className="border-t border-dashed border-gray-200 my-4" />

                <div className="flex justify-between text-xl font-display font-bold text-primary">
                  <span>Grand Total</span>
                  <span>₹{breakdown.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Payment Method</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <label className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all duration-300 ${formData.paymentMethod === 'online' ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}>
                        <input type="radio" name="paymentMethod" value="online" checked={formData.paymentMethod === 'online'} onChange={handleInputChange} className="hidden" />
                        <CreditCard className={`w-6 h-6 mx-auto mb-2 ${formData.paymentMethod === 'online' ? 'text-primary' : 'text-gray-400'}`} />
                        <span className={`font-bold block text-xs uppercase tracking-wider ${formData.paymentMethod === 'online' ? 'text-primary' : 'text-gray-500'}`}>Online Pay</span>
                      </label>
                      <label className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all duration-300 ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}>
                        <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="hidden" />
                        <Banknote className={`w-6 h-6 mx-auto mb-2 ${formData.paymentMethod === 'cod' ? 'text-primary' : 'text-gray-400'}`} />
                        <span className={`font-bold block text-xs uppercase tracking-wider ${formData.paymentMethod === 'cod' ? 'text-primary' : 'text-gray-500'}`}>Cash on Delivery</span>
                      </label>
                    </div>
                  </div>

                  {formData.paymentMethod === 'cod' && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
                      <div className="flex justify-between mb-3 text-sm">
                        <span className="text-yellow-800 font-medium">Pay Now (Advance):</span>
                        <span className="font-bold text-yellow-900">₹{(breakdown.depositTotal + breakdown.platformFee + breakdown.deliveryCharges).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Pay on Delivery:</span>
                        <span className="font-bold text-gray-800">₹{(breakdown.grandTotal - (breakdown.depositTotal + breakdown.platformFee + breakdown.deliveryCharges)).toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] mt-4 pt-3 border-t border-yellow-200/50 text-yellow-800/70 font-medium leading-relaxed">
                        Note: Delivery charges, platform fee, and security deposit are required to be paid online to confirm your booking.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleConfirmBooking}
                    disabled={loading}
                    className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>Processing...</>
                    ) : (
                      `Pay ₹${(formData.paymentMethod === 'online' ? breakdown.grandTotal : (breakdown.depositTotal + breakdown.platformFee + breakdown.deliveryCharges)).toFixed(2)}`
                    )}
                  </button>
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
              Secure SSL Encryption • 100% Data Protection
            </p>
          </div>
        </div >
      </div>
    </div >
  );
};

export default BookingPage;
