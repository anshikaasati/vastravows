import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = () => {
    const { cart, removeFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden"
            style={{
                backgroundImage:
                "url('/images/Pink Illustrative Watercolor Flowers Desktop Wallpaper.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
            >
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-20"></div>
                <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -ml-20"></div>

                <div className="relative z-10 bg-white p-12 rounded-xl shadow-xl border border-gray-100 max-w-lg w-full">
                    <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-display font-medium text-gray-900 mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-8 font-light leading-relaxed">
                        Looks like you havent added any items yet. <br />Start exploring our premium collection.
                    </p>
                    <Link
                        to="/items"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcf8f9] py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-5xl md:text-7xl font-script text-primary/90 mb-12 text-center md:text-left">Shopping Cart</h1>

                <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                    {/* Cart Items */}
                    <div className="space-y-6">
                        {cart.map((item, index) => (
                            <div key={`${item._id}-${item.selectedSize}-${index}`} className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300">
                                <div className="w-full md:w-48 aspect-[3/4] md:aspect-square rounded-xl overflow-hidden bg-gray-100 relative group">
                                    <img
                                        src={item.images?.[0]}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-display font-medium text-gray-900">{item.title}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                    Size: {item.selectedSize}
                                                </span>
                                                {item.rentalPeriod && (
                                                    <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                        {new Date(item.rentalPeriod.startDate).toLocaleDateString()} - {new Date(item.rentalPeriod.endDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item._id, item.selectedSize)}
                                            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                                            title="Remove Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-end">
                                        <div className="text-sm text-gray-500">
                                            {!item.salePrice && (
                                                <p>+ ₹{item.depositAmount} security deposit</p>
                                            )}
                                        </div>
                                        <div>
                                            {item.salePrice ? (
                                                <p className="text-3xl font-display font-medium text-primary">₹{item.salePrice}</p>
                                            ) : (
                                                <div className="text-right">
                                                    <p className="text-3xl font-display font-medium text-primary">
                                                        ₹{item.rentPricePerDay * Math.ceil((new Date(item.rentalPeriod.endDate) - new Date(item.rentalPeriod.startDate)) / (1000 * 60 * 60 * 24))}
                                                    </p>
                                                    <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Total Rent</p>
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
                        <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 sticky top-24">
                            <h3 className="text-2xl font-display font-medium text-gray-900 mb-8 pb-4 border-b border-gray-100">Order Summary</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-600">
                                    <span className="text-sm font-medium">Subtotal</span>
                                    <span className="text-sm font-bold">₹{getCartTotal()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span className="text-sm font-medium">Platform Fee</span>
                                    <span className="text-sm font-bold text-green-600">Free</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 my-4" />
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-display font-medium text-gray-900">Total</span>
                                    <span className="text-3xl font-display font-bold text-primary">₹{getCartTotal()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/booking')}
                                className="w-full py-4 bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-bold">
                                Secure transaction • Money-back guarantee
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
