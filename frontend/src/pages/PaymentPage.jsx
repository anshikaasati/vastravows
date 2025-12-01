import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const paymentMethods = [
  { id: 'upi', label: 'UPI (Google Pay / PhonePe / Paytm)' },
  { id: 'card', label: 'Credit / Debit Card' },
  { id: 'cod', label: 'Cash on Delivery' },
  { id: 'netbanking', label: 'Net Banking' }
];

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('upi');

  useEffect(() => {
    if (!state?.itemId) {
      navigate('/');
    }
  }, [state, navigate]);

  const handleConfirm = (e) => {
    e.preventDefault();
    navigate('/items', { replace: true });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Choose Payment Method</h1>
          <p className="text-gray-500 text-sm mt-1">Complete listing fee for item #{state?.itemId}</p>
        </div>
        <form onSubmit={handleConfirm} className="space-y-4">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer ${
                selectedMethod === method.id ? 'border-primary-berry bg-primary-berry/5' : 'border-gray-200'
              }`}
            >
              <div>
                <p className="font-semibold">{method.label}</p>
                <p className="text-xs text-gray-500">
                  {method.id === 'upi' && 'Instant confirmation via UPI apps'}
                  {method.id === 'card' && 'Supports all VISA / Mastercard / Rupay cards'}
                  {method.id === 'cod' && 'Pay when the item is picked up / delivered'}
                  {method.id === 'netbanking' && 'Works with all major Indian banks'}
                </p>
              </div>
              <input
                type="radio"
                name="payment"
                className="w-4 h-4"
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
              />
            </label>
          ))}
          <button type="submit" className="w-full bg-primary-berry text-white py-3 rounded-md font-semibold">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;


