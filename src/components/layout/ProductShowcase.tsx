'use client';

import { ShoppingBag, Star, TrendingUp, Gift, Sparkles } from 'lucide-react';
import React from 'react';
import Link from 'next/link';

interface ShowcaseCard {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    badge?: string;
    badgeColor?: string;
    icon: React.ReactNode;
}

const showcaseCards: ShowcaseCard[] = [
    {
        id: '1',
        title: 'Shop for your beauty essentials',
        subtitle: 'Premium Quality Products',
        description: 'Discover our curated collection of must-have beauty items',
        image: '/images/beauty-essentials.jpg',
        ctaText: 'Shop Essentials',
        ctaLink: '/#products',
        badge: 'Popular',
        badgeColor: 'bg-blue-500',
        icon: <ShoppingBag className="w-8 h-8 text-blue-600" />
    },
    {
        id: '2',
        title: 'New beauty arrivals under $50',
        subtitle: 'Fresh & Affordable',
        description: 'Be the first to try our latest beauty innovations',
        image: '/images/new-arrivals.jpg',
        ctaText: 'Explore New',
        ctaLink: '/#products',
        badge: 'New',
        badgeColor: 'bg-green-500',
        icon: <Sparkles className="w-8 h-8 text-green-600" />
    },
    {
        id: '3',
        title: 'Shop Beauty for less',
        subtitle: 'Amazing Deals',
        description: 'Quality beauty products at unbeatable prices',
        image: '/images/beauty-deals.jpg',
        ctaText: 'View Deals',
        ctaLink: '/#products',
        badge: 'Sale',
        badgeColor: 'bg-red-500',
        icon: <TrendingUp className="w-8 h-8 text-red-600" />
    },
    {
        id: '4',
        title: 'Get your beauty game on',
        subtitle: 'Professional Tools',
        description: 'Elevate your beauty routine with premium tools and accessories',
        image: '/images/beauty-tools.jpg',
        ctaText: 'Shop Tools',
        ctaLink: '/#products',
        badge: 'Featured',
        badgeColor: 'bg-purple-500',
        icon: <Star className="w-8 h-8 text-purple-600" />
    }
];

const ProductShowcase = () => {
    return (
        <section className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Discover Your Perfect Beauty
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore our carefully curated beauty categories and find everything you need for your beauty routine
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {showcaseCards.map((card) => (
                        <div
                            key={card.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
                        >
                            {/* Card Header */}
                            <div className="p-6 pb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                        {card.icon}
                                    </div>
                                    {card.badge && (
                                        <span className={`${card.badgeColor} text-white text-xs font-medium px-2 py-1 rounded-full`}>
                                            {card.badge}
                                        </span>
                                    )}
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                    {card.title}
                                </h3>
                                
                                <h4 className="text-sm font-medium text-gray-600 mb-2">
                                    {card.subtitle}
                                </h4>
                                
                                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                                    {card.description}
                                </p>
                            </div>

                            {/* Card Footer */}
                            <div className="px-6 pb-6">
                                <Link
                                    href={card.ctaLink}
                                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors group-hover:underline"
                                >
                                    {card.ctaText}
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Hover Effect Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
                        <div className="flex items-center justify-center mb-4">
                            <Gift className="w-12 h-12 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Ready to Transform Your Beauty Routine?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Join thousands of satisfied customers who trust Utrabeauty for their beauty needs
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/#products"
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors transform hover:scale-105 shadow-lg"
                            >
                                Start Shopping
                            </Link>
                            <Link
                                href="/auth/sign-in"
                                className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold py-3 px-8 rounded-full transition-colors transform hover:scale-105"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductShowcase; 