
import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecommendedCard = ({ item }) => {
    const navigate = useNavigate();

    return (
        <div
            className="flex-shrink-0 w-40 sm:w-48 md:w-56 cursor-pointer group flex flex-col gap-2"
            onClick={() => {
                navigate(`/items/${item._id}`);
                window.scrollTo(0, 0); // Ensure page scrolls to top
            }}
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                    src={item.images?.[0]}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Rating Badge */}
                {item.rating > 0 && (
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 flex items-center gap-1 rounded text-xs font-semibold shadow-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating}</span>
                    </div>
                )}
                )}

                {/* Quick Action Button - Appears on Hover */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center pb-6">
                    <span className="bg-white/90 backdrop-blur text-primary text-xs font-bold uppercase tracking-widest px-6 py-3 shadow-lg hover:bg-primary hover:text-white transition-colors">
                        View Details
                    </span>
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">{item.title}</h3>

                <div className="flex items-center justify-between">
                    {item.salePrice ? (
                        <p className="text-sm font-semibold text-gray-900">₹{item.salePrice}</p>
                    ) : (
                        <p className="text-sm font-semibold text-primary">₹{item.rentPricePerDay}<span className="text-xs text-gray-500 font-normal">/day</span></p>
                    )}
                </div>
            </div>


        </div>
    );
};

export default RecommendedCard;
