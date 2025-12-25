
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RecommendedCard from './RecommendedCard';

const RecommendedCarousel = ({ items = [] }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = current.clientWidth * 0.75; // Scroll 75% of container width

            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="mt-12 md:mt-16 border-t border-gray-100 pt-12">
            <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-xl md:text-2xl font-display font-medium text-gray-900"> Similar Items</h3>

                {/* Navigation - Hidden on mobile, visible on desktop */}
                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        aria-label="Previous recommendations"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        aria-label="Next recommendations"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item) => (
                    <div key={item._id} className="snap-start">
                        <RecommendedCard item={item} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedCarousel;
