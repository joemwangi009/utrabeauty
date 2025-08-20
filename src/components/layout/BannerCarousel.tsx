'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BannerSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    video?: string;
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
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
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
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
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
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
        video: 'https://player.vimeo.com/video/328217769?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1',
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
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
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
                        <div className="relative w-full h-full">
                            {/* Background Image/Video */}
                            {slide.video ? (
                                <iframe
                                    src={slide.video}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    frameBorder="0"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div 
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                    style={{ backgroundImage: `url(${slide.image})` }}
                                />
                            )}
                            
                            {/* Overlay for better text readability */}
                            <div className="absolute inset-0 bg-black/30" />
                            
                            {/* Content */}
                            <div className="relative z-10 flex items-center h-full">
                                <div className="container mx-auto px-4 md:px-8">
                                    <div className="max-w-2xl">
                                        <div className={`text-white ${slide.textColor === 'text-gray-800' ? 'text-white' : slide.textColor}`}>
                                            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
                                                {slide.title}
                                            </h2>
                                            <h3 className="text-xl md:text-3xl font-semibold mb-4 text-white/90 drop-shadow-lg">
                                                {slide.subtitle}
                                            </h3>
                                            <p className="text-lg md:text-xl mb-8 text-white/80 max-w-lg leading-relaxed drop-shadow-lg">
                                                {slide.description}
                                            </p>
                                            <button
                                                onClick={() => window.location.href = slide.ctaLink}
                                                className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                                            >
                                                {slide.ctaText}
                                            </button>
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