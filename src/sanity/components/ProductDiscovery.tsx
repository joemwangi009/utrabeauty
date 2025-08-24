import React, { useState, useEffect } from 'react';
import { set, unset } from 'sanity';
import { PatchEvent } from 'sanity';

interface ProductDiscoveryProps {
  onChange: (patch: PatchEvent) => void;
  value?: any;
}

interface DiscoveredProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  images: string[];
  url: string;
  supplierName: string;
  supplierRating?: number;
  productRating?: number;
  soldCount?: number;
  minOrderQuantity?: string;
  material?: string;
  color?: string;
  size?: string;
  brand?: string;
  warranty?: string;
  shippingInfo?: {
    free: boolean;
    cost?: number;
    estimatedDays?: number;
    fromCountry?: string;
  };
  productSpecs?: Record<string, string>;
  scrapedAt: string;
}

interface SearchFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'price' | 'relevance' | 'newest' | 'rating' | 'sold';
  supplierRating: string;
}

export const ProductDiscovery: React.FC<ProductDiscoveryProps> = ({ onChange, value }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [discoveredProducts, setDiscoveredProducts] = useState<DiscoveredProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<DiscoveredProduct | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'relevance',
    supplierRating: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string[]>([]);

  // Function to create a patch for a specific field
  const createFieldPatch = (fieldPath: string[], value: any) => {
    return set(value, fieldPath);
  };

  // Function to apply patches to multiple fields
  const applyFieldPatches = (patches: any[]) => {
    try {
      const patchEvent = PatchEvent.from(patches);
      onChange(patchEvent);
      return true;
    } catch (error) {
      console.error('❌ Failed to apply patches:', error);
      return false;
    }
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setError(null);
    setDiscoveredProducts([]);

    try {
      const response = await fetch('/api/discover-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          filters
        }),
      });

      const data = await response.json();

      if (data.success && data.products) {
        setDiscoveredProducts(data.products);
        if (data.products.length === 0) {
          setError('No products found. Try adjusting your search terms or filters.');
        }
      } else {
        setError(data.error || 'Failed to discover products');
      }
    } catch (err) {
      setError('Network error occurred. Please check your connection and try again.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const importProduct = async (product: DiscoveredProduct) => {
    setSelectedProduct(product);
    setIsImporting(true);
    setImportProgress([]);
    
    try {
      setImportProgress(prev => [...prev, `🚀 Starting import: ${product.title.substring(0, 40)}...`]);
      
      // Call the production-grade product creation API
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: product,
          categoryId: 'electronics', // Default category - can be enhanced later
          customPrice: parseFloat(product.price.replace(/[^\d.,]/g, '')) || 29.99,
          customStock: 100,
          customTags: ['alibaba-imported', 'production-ready', 'verified-supplier']
        }),
      });

      const data = await response.json();

      if (data.success) {
        setImportProgress(prev => [...prev, `✅ Product imported successfully!`]);
        setImportProgress(prev => [...prev, `📝 Title: ${data.product.title}`]);
        setImportProgress(prev => [...prev, `💰 Price: $${data.product.price}`]);
        setImportProgress(prev => [...prev, `🏪 Supplier: ${data.product.supplierName}`]);
        setImportProgress(prev => [...prev, `🔗 Slug: ${data.product.slug}`]);
        setImportProgress(prev => [...prev, `📅 Imported: ${new Date(data.product.importedAt).toLocaleDateString()}`]);
        
        setIsImporting(false);
        
        // Show success message
        setSuccess(`🎉 SUCCESS! Product "${data.product.title}" has been added to your catalog!`);
        setTimeout(() => setSuccess(null), 10000);
        
        // Clear the search results to show the imported product
        setDiscoveredProducts([]);
        setSearchQuery('');
        
      } else {
        throw new Error(data.error || 'Failed to import product');
      }

    } catch (error) {
      console.error('❌ Product import error:', error);
      setError(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsImporting(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDiscoveredProducts([]);
    setError(null);
    setSuccess(null);
    setSelectedProduct(null);
  };

  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price.replace(/[^\d.,]/g, ''));
    return isNaN(numericPrice) ? price : `$${numericPrice.toFixed(2)}`;
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return '⭐';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🚀 Alibaba Product Discovery & Import
        </h2>
        <p className="text-gray-600">
          Search for products on Alibaba and import them directly to your catalog with one click.
        </p>
      </div>

      {/* Search Interface */}
      <div className="mb-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products (e.g., 'wireless headphones', 'smartphone cases')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
            />
          </div>
          <button 
            onClick={searchProducts}
            disabled={isSearching}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSearching ? '🔍 Searching...' : '🔍 Search'}
          </button>
          {discoveredProducts.length > 0 && (
            <button
              onClick={clearSearch}
              className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              🗑️ Clear
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Garden</option>
            <option value="beauty">Beauty & Health</option>
            <option value="sports">Sports & Outdoor</option>
          </select>
          
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Relevance</option>
            <option value="price">Price: Low to High</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest Rating</option>
            <option value="sold">Most Sold</option>
          </select>
          
          <select
            value={filters.supplierRating}
            onChange={(e) => setFilters(prev => ({ ...prev, supplierRating: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
          </select>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">❌</span>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Success Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Import Progress */}
      {isImporting && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-blue-600 mr-2">🔄</span>
            <span className="text-blue-800 font-medium">Importing Product...</span>
          </div>
          <div className="space-y-1">
            {importProgress.map((step, index) => (
              <div key={index} className="text-sm text-blue-700">{step}</div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {discoveredProducts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📦 Found {discoveredProducts.length} Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoveredProducts.map((product) => (
              <div 
                key={product.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                {/* Product Image */}
                <div className="mb-3">
                  <img
                    src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.title}
                    className="w-full h-32 object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                
                {/* Product Info */}
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                    {product.title}
                  </h4>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">{product.supplierName}</span>
                    {product.supplierRating && (
                      <span className="text-xs text-yellow-600">
                        {getRatingStars(product.supplierRating)}
                      </span>
                    )}
                  </div>

                  {product.soldCount && (
                    <div className="text-xs text-gray-500 mb-2">
                      📦 {product.soldCount.toLocaleString()} sold
                    </div>
                  )}
                  
                  {product.shippingInfo && (
                    <div className="text-xs text-gray-500 mb-2">
                      🚚 {product.shippingInfo.free ? 'Free Shipping' : `$${product.shippingInfo.cost} shipping`}
                    </div>
                  )}
                  </div>
                  
                {/* Import Button */}
                  <button
                  onClick={() => importProduct(product)}
                  disabled={isImporting}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {isImporting && selectedProduct?.id === product.id ? '🔄 Importing...' : '📥 Import to Catalog'}
                  </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!isSearching && discoveredProducts.length === 0 && searchQuery && !error && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-600">No products found for &quot;{searchQuery}&quot;</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Initial State */}
      {!searchQuery && discoveredProducts.length === 0 && !error && !success && (
        <div className="text-center py-12">
          <div className="text-blue-400 text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Discover Products</h3>
          <p className="text-gray-600 mb-4">
            Enter a search term above to find products on Alibaba
          </p>
          <div className="text-sm text-gray-500 space-y-1">
                         <p>💡 Try searching for: &quot;wireless headphones&quot;, &quot;smartphone cases&quot;, &quot;kitchen appliances&quot;</p>
            <p>🔍 Use filters to narrow down results by price, category, or supplier rating</p>
                         <p>📥 Click &quot;Import to Catalog&quot; to add products with one click</p>
          </div>
        </div>
      )}
    </div>
  );
}; 