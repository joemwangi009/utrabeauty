'use client';

import { Search, MapPin, ChevronDown, X } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
}

interface SearchSuggestion {
    id: string;
    text: string;
    type: 'product' | 'category' | 'trending';
    count?: number;
}

const searchCategories: SearchCategory[] = [
    { id: 'all', name: 'All', description: 'Search across all categories', icon: '🔍' },
    { id: 'skincare', name: 'Skincare', description: 'Facial care, cleansers, moisturizers', icon: '🧴' },
    { id: 'makeup', name: 'Makeup', description: 'Cosmetics, lipsticks, foundations', icon: '💄' },
    { id: 'haircare', name: 'Hair Care', description: 'Shampoos, conditioners, styling', icon: '💇‍♀️' },
    { id: 'fragrances', name: 'Fragrances', description: 'Perfumes, colognes, body sprays', icon: '🌸' },
    { id: 'tools', name: 'Beauty Tools', description: 'Brushes, applicators, devices', icon: '🪞' },
    { id: 'bath', name: 'Bath & Body', description: 'Soaps, lotions, bath products', icon: '🛁' },
    { id: 'wellness', name: 'Wellness', description: 'Vitamins, supplements, health', icon: '💊' }
];

const trendingSearches: SearchSuggestion[] = [
    { id: '1', text: 'Vitamin C serum', type: 'trending', count: 1250 },
    { id: '2', text: 'Retinol cream', type: 'trending', count: 980 },
    { id: '3', text: 'Hyaluronic acid', type: 'trending', count: 756 },
    { id: '4', text: 'Korean skincare', type: 'trending', count: 654 },
    { id: '5', text: 'Clean beauty', type: 'trending', count: 543 }
];

const ProfessionalSearchBar = () => {
    const [selectedCategory, setSelectedCategory] = useState<SearchCategory>(searchCategories[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);
    const categoryRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchSuggestions(false);
            }
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate search suggestions based on query
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchSuggestions([]);
            setShowSearchSuggestions(false);
            return;
        }

        // Simulate search suggestions
        const suggestions: SearchSuggestion[] = [
            ...trendingSearches.filter(item => 
                item.text.toLowerCase().includes(searchQuery.toLowerCase())
            ),
            { id: 'custom1', text: `Search for "${searchQuery}" in ${selectedCategory.name}`, type: 'category' },
            { id: 'custom2', text: `Find ${searchQuery} products`, type: 'product' }
        ];

        setSearchSuggestions(suggestions.slice(0, 8));
        setShowSearchSuggestions(true);
    }, [searchQuery, selectedCategory]);

    const handleSearch = (query?: string) => {
        const searchTerm = query || searchQuery;
        if (searchTerm.trim()) {
            setIsSearching(true);
            // Navigate to search results page
            router.push(`/search?q=${encodeURIComponent(searchTerm)}&category=${selectedCategory.id}`);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        if (suggestion.type === 'trending') {
            setSearchQuery(suggestion.text);
            handleSearch(suggestion.text);
        } else {
            handleSearch(suggestion.text);
        }
        setShowSearchSuggestions(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto" ref={searchRef}>
            <div className="relative">
                {/* Main Search Bar */}
                <div className="flex items-center bg-white border-2 border-gray-300 hover:border-orange-400 focus-within:border-orange-500 rounded-lg shadow-sm transition-all duration-300">
                    {/* Category Dropdown */}
                    <div className="relative" ref={categoryRef}>
                        <button
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-l-lg transition-colors border-r border-gray-300 min-w-[140px]"
                        >
                            <span className="text-lg">{selectedCategory.icon}</span>
                            <span className="font-medium text-sm">{selectedCategory.name}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Category Dropdown Menu */}
                        {showCategoryDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                                {searchCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setShowCategoryDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <span className="text-xl">{category.icon}</span>
                                        <div>
                                            <div className="font-medium text-gray-900">{category.name}</div>
                                            <div className="text-sm text-gray-500">{category.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Search ${selectedCategory.name.toLowerCase()}...`}
                            className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none text-lg"
                        />
                        
                        {/* Clear Button */}
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-16 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={() => handleSearch()}
                        disabled={!searchQuery.trim() || isSearching}
                        className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium rounded-r-lg transition-colors flex items-center gap-2"
                    >
                        {isSearching ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                        Search
                    </button>
                </div>

                {/* Search Suggestions */}
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-40 max-h-96 overflow-y-auto">
                        {/* Trending Searches */}
                        {searchSuggestions.filter(s => s.type === 'trending').length > 0 && (
                            <div className="p-3 border-b border-gray-100">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Trending Searches
                                </div>
                                {searchSuggestions.filter(s => s.type === 'trending').map((suggestion) => (
                                    <button
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors text-left"
                                    >
                                        <span className="text-gray-700">{suggestion.text}</span>
                                        <span className="text-xs text-gray-400">{suggestion.count} searches</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Other Suggestions */}
                        {searchSuggestions.filter(s => s.type !== 'trending').map((suggestion) => (
                            <button
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full p-3 hover:bg-gray-50 transition-colors text-left text-gray-700"
                            >
                                {suggestion.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Category Pills */}
            <div className="flex flex-wrap gap-2 mt-3">
                {searchCategories.slice(1, 6).map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory.id === category.id
                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {category.icon} {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProfessionalSearchBar; 