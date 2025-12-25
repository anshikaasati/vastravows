import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ItemCard from './ItemCard';

const ItemCarousel = ({ items = [] }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = current.clientWidth * 0.75;

            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="relative group/carousel">
            {/* Navigation Buttons - Visible on Desktop hover or always? tailored for clean UI */}
            <div className="hidden md:block">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 rounded-full bg-white shadow-lg text-gray-800 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-0"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 rounded-full bg-white shadow-lg text-gray-800 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-8 pt-2 px-1 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item) => (
                    <div key={item._id} className="snap-start flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px]">
                        <ItemCard item={item} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItemCarousel;
