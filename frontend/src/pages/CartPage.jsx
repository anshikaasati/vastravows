import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = () => {
    const { cart, removeFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
                <Link
                    to="/items"
                    className="px-8 py-3 bg-primary-berry text-white font-semibold rounded-xl shadow-lg hover:bg-primary-dark transition"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
                {/* Cart Items */}
                <div className="space-y-4">
                    {cart.map((item, index) => (
                        <div key={`${item._id}-${item.selectedSize}-${index}`} className="glass-panel p-4 rounded-2xl flex gap-4 md:gap-6">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0">
                                <img
                                    src={item.images?.[0]}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">Size: <span className="font-semibold text-gray-900">{item.selectedSize}</span></p>
                                        {item.rentalPeriod && (
                                            <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg inline-block">
                                                {new Date(item.rentalPeriod.startDate).toLocaleDateString()} - {new Date(item.rentalPeriod.endDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item._id, item.selectedSize)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-auto flex justify-between items-end">
                                    <div>
                                        {item.salePrice ? (
                                            <p className="font-bold text-lg text-gray-900">₹{item.salePrice}</p>
                                        ) : (
                                            <div>
                                                <p className="font-bold text-lg text-gray-900">
                                                    ₹{item.rentPricePerDay * Math.ceil((new Date(item.rentalPeriod.endDate) - new Date(item.rentalPeriod.startDate)) / (1000 * 60 * 60 * 24))}
                                                </p>
                                                <p className="text-xs text-gray-500">+ ₹{item.depositAmount} Deposit</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="h-fit space-y-6">
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{getCartTotal()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Platform Fee</span>
                                <span>₹0</span>
                            </div>
                            <div className="border-t border-gray-200 my-2" />
                            <div className="flex justify-between text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span>₹{getCartTotal()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/booking')}
                            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
                        >
                            Proceed to Checkout
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
