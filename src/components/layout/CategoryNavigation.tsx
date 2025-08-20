'use client';

import { ChevronDown, Sparkles, TrendingUp, Gift, Star } from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';

interface CategoryItem {
    id: string;
    name: string;
    icon: string;
    href: string;
    description?: string;
    subcategories?: string[];
    featured?: boolean;
}

const categories: CategoryItem[] = [
    {
        id: 'skincare',
        name: 'Skincare',
        icon: '🧴',
        href: '/category/skincare',
        description: 'Facial care, cleansers, moisturizers',
        subcategories: ['Cleansers', 'Moisturizers', 'Serums', 'Masks', 'Sunscreen', 'Anti-aging'],
        featured: true
    },
    {
        id: 'makeup',
        name: 'Makeup',
        icon: '💄',
        href: '/category/makeup',
        description: 'Cosmetics, lipsticks, foundations',
        subcategories: ['Face', 'Eyes', 'Lips', 'Nails', 'Brushes', 'Accessories'],
        featured: true
    },
    {
        id: 'haircare',
        name: 'Hair Care',
        icon: '💇‍♀️',
        href: '/category/haircare',
        description: 'Shampoos, conditioners, styling',
        subcategories: ['Shampoo', 'Conditioner', 'Styling', 'Treatments', 'Tools', 'Accessories'],
        featured: true
    },
    {
        id: 'fragrances',
        name: 'Fragrances',
        icon: '🌸',
        href: '/category/fragrances',
        description: 'Perfumes, colognes, body sprays',
        subcategories: ['Women', 'Men', 'Unisex', 'Body Sprays', 'Gift Sets', 'Miniatures']
    },
    {
        id: 'tools',
        name: 'Beauty Tools',
        icon: '🪞',
        href: '/category/tools',
        description: 'Brushes, applicators, devices',
        subcategories: ['Brushes', 'Applicators', 'Devices', 'Mirrors', 'Organizers', 'Cleaning']
    },
    {
        id: 'bath',
        name: 'Bath & Body',
        icon: '🛁',
        href: '/category/bath-body',
        description: 'Soaps, lotions, bath products',
        subcategories: ['Body Wash', 'Lotions', 'Bath Products', 'Hand Care', 'Foot Care', 'Gift Sets']
    },
    {
        id: 'wellness',
        name: 'Wellness',
        icon: '💊',
        href: '/category/wellness',
        description: 'Vitamins, supplements, health',
        subcategories: ['Vitamins', 'Supplements', 'Health', 'Fitness', 'Nutrition', 'Self-care']
    }
];

const CategoryNavigation = () => {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-12">
                    {/* Main Categories */}
                    <div className="flex items-center space-x-8">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="relative group"
                                onMouseEnter={() => setHoveredCategory(category.id)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <Link
                                    href={category.href}
                                    className="flex items-center gap-2 py-3 px-2 text-gray-700 hover:text-orange-600 font-medium text-sm transition-colors"
                                >
                                    <span className="text-lg">{category.icon}</span>
                                    <span>{category.name}</span>
                                    {category.subcategories && (
                                        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                                    )}
                                </Link>

                                {/* Mega Menu */}
                                {hoveredCategory === category.id && category.subcategories && (
                                    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4">
                                        <div className="mb-3">
                                            <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                                            <p className="text-sm text-gray-600">{category.description}</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            {category.subcategories.map((subcategory, index) => (
                                                <Link
                                                    key={index}
                                                    href={`${category.href}/${subcategory.toLowerCase().replace(' ', '-')}`}
                                                    className="p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                                                >
                                                    {subcategory}
                                                </Link>
                                            ))}
                                        </div>

                                        {category.featured && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
                                                    <Star className="w-4 h-4" />
                                                    Featured Category
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Special Links */}
                    <div className="flex items-center space-x-6">
                        <Link
                            href="/deals"
                            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Today's Deals
                        </Link>
                        
                        <Link
                            href="/new-arrivals"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            New Arrivals
                        </Link>
                        
                        <Link
                            href="/gift-guide"
                            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                        >
                            <Gift className="w-4 h-4" />
                            Gift Guide
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default CategoryNavigation; 