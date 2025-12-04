import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item, size, rentalPeriod) => {
        // Check if item with same ID and size already exists
        const existingItemIndex = cart.findIndex(
            (cartItem) => cartItem._id === item._id && cartItem.selectedSize === size
        );

        if (existingItemIndex > -1) {
            toast.error('Item with this size is already in your cart');
            return;
        }

        const cartItem = {
            ...item,
            selectedSize: size,
            rentalPeriod: rentalPeriod || null, // { startDate, endDate }
            addedAt: new Date().toISOString()
        };

        setCart((prev) => [...prev, cartItem]);
        toast.success('Added to cart');
    };

    const removeFromCart = (itemId, size) => {
        setCart((prev) => prev.filter((item) => !(item._id === itemId && item.selectedSize === size)));
        toast.success('Removed from cart');
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            if (item.rentPricePerDay && item.rentalPeriod) {
                const days = Math.ceil((new Date(item.rentalPeriod.endDate) - new Date(item.rentalPeriod.startDate)) / (1000 * 60 * 60 * 24));
                return total + (item.rentPricePerDay * days) + (item.depositAmount || 0);
            }
            return total + (item.salePrice || 0);
        }, 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal }}>
            {children}
        </CartContext.Provider>
    );
};
