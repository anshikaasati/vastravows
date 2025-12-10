import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = () => {
    const { cart, removeFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-primary mb-3">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-8 max-w-md">Looks like you haven't added any items yet. Start exploring our collection!</p>
                <Link
                    to="/items"
                    className="px-8 py-4 btn-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-8">Shopping Cart</h1>

                <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                    {/* Cart Items */}
                    <div className="space-y-4">
                        {cart.map((item, index) => (
                            <div key={`${item._id}-${item.selectedSize}-${index}`} className="glass-card p-6 rounded-3xl flex gap-6 hover:shadow-xl transition-shadow">
                                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-primary/10">
                                    <img
                                        src={item.images?.[0]}
                                        alt={item.title}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-display font-semibold text-primary mb-2">{item.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Size: <span className="font-semibold text-primary">{item.selectedSize}</span>
                                            </p>
                                            {item.rentalPeriod && (
                                                <p className="text-xs text-gray-500 bg-primary/5 px-3 py-1.5 rounded-lg inline-block border border-primary/10">
                                                    {new Date(item.rentalPeriod.startDate).toLocaleDateString()} - {new Date(item.rentalPeriod.endDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item._id, item.selectedSize)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="mt-auto flex justify-between items-end">
                                        <div>
                                            {item.salePrice ? (
                                                <p className="font-display font-bold text-2xl text-primary">₹{item.salePrice}</p>
                                            ) : (
                                                <div>
                                                    <p className="font-display font-bold text-2xl text-primary">
                                                        ₹{item.rentPricePerDay * Math.ceil((new Date(item.rentalPeriod.endDate) - new Date(item.rentalPeriod.startDate)) / (1000 * 60 * 60 * 24))}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">+ ₹{item.depositAmount} Deposit</p>
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
                        <div className="glass-card p-8 rounded-3xl sticky top-24">
                            <h3 className="text-2xl font-display font-bold text-primary mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="font-semibold">₹{getCartTotal()}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span className="font-medium">Platform Fee</span>
                                    <span className="font-semibold text-green-600">₹0</span>
                                </div>
                                <div className="border-t-2 border-primary/10 my-4" />
                                <div className="flex justify-between text-xl font-display font-bold text-primary">
                                    <span>Total</span>
                                    <span>₹{getCartTotal()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/booking')}
                                className="w-full py-4 btn-primary font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-white"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Secure transaction • 100% Money-back guarantee
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
