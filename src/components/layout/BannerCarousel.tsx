'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BannerSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    backgroundColor: string;
    textColor: string;
}

const bannerSlides: BannerSlide[] = [
    {
        id: '1',
        title: 'Beauty Essentials Under $50',
        subtitle: 'Premium Quality, Affordable Prices',
        description: 'Discover our curated collection of beauty must-haves that won\'t break the bank',
        image: '/images/banner-1.jpg',
        ctaText: 'Shop Now',
        ctaLink: '/#products',
        backgroundColor: 'bg-gradient-to-r from-pink-100 to-purple-100',
        textColor: 'text-gray-800'
    },
    {
        id: '2',
        title: 'New Arrivals - Limited Time',
        subtitle: 'Fresh Beauty Products',
        description: 'Be the first to try our latest beauty innovations and trending products',
        image: '/images/banner-2.jpg',
        ctaText: 'Explore New',
        ctaLink: '/#products',
        backgroundColor: 'bg-gradient-to-r from-blue-100 to-indigo-100',
        textColor: 'text-gray-800'
    },
    {
        id: '3',
        title: 'VIP Beauty Club',
        subtitle: 'Exclusive Member Benefits',
        description: 'Join our beauty community and unlock special discounts, early access, and exclusive offers',
        image: '/images/banner-3.jpg',
        ctaText: 'Join Now',
        ctaLink: '/auth/sign-in',
        backgroundColor: 'bg-gradient-to-r from-emerald-100 to-teal-100',
        textColor: 'text-gray-800'
    },
    {
        id: '4',
        title: 'Free Shipping on Orders $50+',
        subtitle: 'Shop More, Save More',
        description: 'Enjoy free shipping on all orders over $50 and discover amazing beauty deals',
        image: '/images/banner-4.jpg',
        ctaText: 'Start Shopping',
        ctaLink: '/#products',
        backgroundColor: 'bg-gradient-to-r from-yellow-100 to-orange-100',
        textColor: 'text-gray-800'
    }
];

const BannerCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-white">
            {/* Main Carousel */}
            <div className="relative w-full h-full">
                {bannerSlides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                            index === currentSlide
                                ? 'opacity-100 translate-x-0'
                                : index < currentSlide
                                ? 'opacity-0 -translate-x-full'
                                : 'opacity-0 translate-x-full'
                        }`}
                    >
                        <div className={`w-full h-full ${slide.backgroundColor} flex items-center`}>
                            <div className="container mx-auto px-4 md:px-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                                    {/* Content */}
                                    <div className={`text-center md:text-left ${slide.textColor}`}>
                                        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                                            {slide.title}
                                        </h2>
                                        <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-600">
                                            {slide.subtitle}
                                        </h3>
                                        <p className="text-lg md:text-xl mb-8 text-gray-700 max-w-md">
                                            {slide.description}
                                        </p>
                                        <button
                                            onClick={() => window.location.href = slide.ctaLink}
                                            className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                        >
                                            {slide.ctaText}
                                        </button>
                                    </div>
                                    
                                    {/* Image Placeholder */}
                                    <div className="hidden md:flex justify-center">
                                        <div className="w-80 h-80 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                                            <div className="text-center text-gray-600">
                                                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                                                    <span className="text-2xl">🎨</span>
                                                </div>
                                                <p className="text-sm">Banner Image</p>
                                                <p className="text-xs text-gray-500">Professional Design</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                aria-label="Next slide"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                {bannerSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentSlide
                                ? 'bg-white scale-125 shadow-lg'
                                : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                <div
                    className="h-full bg-white transition-all duration-300 ease-linear"
                    style={{
                        width: `${((currentSlide + 1) / bannerSlides.length) * 100}%`
                    }}
                />
            </div>
        </div>
    );
};

export default BannerCarousel; 