import { createContext, useContext, useEffect, useState } from 'react';
import { wishlistApi } from '../api/services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
    const { token } = useAuth();
    const [wishlist, setWishlist] = useState(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            loadWishlist();
        } else {
            setWishlist(new Set());
        }
    }, [token]);

    const loadWishlist = async () => {
        try {
            const { data } = await wishlistApi.list();
            // data is array of Wishlist documents with populated itemId
            const ids = new Set(data.map(doc => {
                // Handle populated itemId object or raw ID string
                return doc.itemId?._id || doc.itemId;
            }));
            setWishlist(ids);
        } catch (error) {
            console.error('Failed to load wishlist', error);
        }
    };

    const toggleWishlist = async (itemId) => {
        try {
            const { data } = await wishlistApi.add(itemId); // 'add' endpoint now toggles

            if (data.action === 'added') {
                setWishlist(prev => new Set(prev).add(itemId));
                toast.success('Added to wishlist');
            } else if (data.action === 'removed') {
                setWishlist(prev => {
                    const next = new Set(prev);
                    next.delete(itemId);
                    return next;
                });
                toast.success('Removed from wishlist');
            }
        } catch (error) {
            toast.error('Failed to update wishlist');
        }
    };

    const isInWishlist = (itemId) => wishlist.has(itemId);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
