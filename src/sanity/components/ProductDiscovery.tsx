import React, { useState, useEffect } from 'react';
import { set, unset } from 'sanity';
import { PatchEvent } from 'sanity';
import { Stack, Card, Text, Button, TextInput, Select, Box, Flex, Grid, Badge, Spinner } from '@sanity/ui';

interface ProductDiscoveryProps {
  onChange: (patch: PatchEvent) => void;
  value?: any;
  type?: any;
  markers?: any[];
  presence?: any[];
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
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

export const ProductDiscovery: React.FC<ProductDiscoveryProps> = ({ 
  onChange, 
  value, 
  type, 
  markers, 
  presence, 
  onFocus, 
  onBlur, 
  readOnly 
}) => {
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

  // If readOnly, show a simple message
  if (readOnly) {
    return (
      <Card padding={4} tone="primary">
        <Text>Product Discovery component is read-only</Text>
      </Card>
    );
  }

  return (
    <Stack space={4}>
      {/* Header */}
      <Card padding={4} tone="primary">
        <Stack space={3}>
          <Text size={4} weight="semibold">
            🚀 Alibaba Product Discovery & Import
          </Text>
          <Text size={2} muted>
            Search for products on Alibaba and import them directly to your catalog with one click.
          </Text>
        </Stack>
      </Card>

      {/* Search Interface */}
      <Card padding={4}>
        <Stack space={4}>
          <Flex gap={3}>
            <Box flex={1}>
              <TextInput
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                placeholder="Search for products (e.g., 'wireless headphones', 'smartphone cases')"
                onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
                disabled={isSearching}
              />
            </Box>
            <Button 
              onClick={searchProducts}
              disabled={isSearching}
              tone="primary"
            >
              {isSearching ? '🔍 Searching...' : '🔍 Search'}
            </Button>
            {discoveredProducts.length > 0 && (
              <Button
                onClick={clearSearch}
                tone="default"
              >
                🗑️ Clear
              </Button>
            )}
          </Flex>

          {/* Advanced Filters */}
          <Grid columns={[2, 2, 5]} gap={3}>
            <Select
              value={filters.category}
              onChange={(event) => setFilters(prev => ({ ...prev, category: event.currentTarget.value }))}
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
              <option value="beauty">Beauty & Health</option>
              <option value="sports">Sports & Outdoor</option>
            </Select>
            
            <TextInput
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(event) => setFilters(prev => ({ ...prev, minPrice: event.currentTarget.value }))}
            />
            
            <TextInput
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(event) => setFilters(prev => ({ ...prev, maxPrice: event.currentTarget.value }))}
            />
            
            <Select
              value={filters.sortBy}
              onChange={(event) => setFilters(prev => ({ ...prev, sortBy: event.currentTarget.value as any }))}
            >
              <option value="relevance">Relevance</option>
              <option value="price">Price: Low to High</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rating</option>
              <option value="sold">Most Sold</option>
            </Select>
            
            <Select
              value={filters.supplierRating}
              onChange={(event) => setFilters(prev => ({ ...prev, supplierRating: event.currentTarget.value }))}
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </Select>
          </Grid>
        </Stack>
      </Card>

      {/* Error Message */}
      {error && (
        <Card padding={4} tone="critical">
          <Flex align="center" gap={2}>
            <Text size={2}>❌</Text>
            <Text size={2}>{error}</Text>
          </Flex>
        </Card>
      )}

      {/* Success Message */}
      {success && (
        <Card padding={4} tone="positive">
          <Flex align="center" gap={2}>
            <Text size={2}>✅</Text>
            <Text size={2}>{success}</Text>
          </Flex>
        </Card>
      )}

      {/* Import Progress */}
      {importProgress.length > 0 && (
        <Card padding={4} tone="primary">
          <Stack space={3}>
            <Text size={2} weight="semibold">📊 Import Progress:</Text>
            <Stack space={2}>
              {importProgress.map((message, index) => (
                <Text key={index} size={1}>
                  {message}
                </Text>
              ))}
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Search Results */}
      {discoveredProducts.length > 0 && (
        <Card padding={4}>
          <Stack space={4}>
            <Text size={3} weight="semibold">
              🔍 Found {discoveredProducts.length} products
            </Text>
            <Grid columns={[1, 2, 3]} gap={4}>
              {discoveredProducts.map((product) => (
                <Card key={product.id} padding={3} shadow={1}>
                  <Stack space={3}>
                    {/* Product Image */}
                    <Box>
                      <img
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.title}
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </Box>
                    
                    {/* Product Info */}
                    <Stack space={2}>
                      <Text size={2} weight="semibold" style={{ lineHeight: '1.4' }}>
                        {product.title}
                      </Text>
                      
                      <Flex justify="space-between" align="center">
                        <Text size={3} weight="bold" style={{ color: 'var(--card-fg-color)' }}>
                          {formatPrice(product.price)}
                        </Text>
                        {product.originalPrice && (
                          <Text size={1} muted style={{ textDecoration: 'line-through' }}>
                            {formatPrice(product.originalPrice)}
                          </Text>
                        )}
                      </Flex>

                      <Flex align="center" gap={2}>
                        <Text size={1} muted>{product.supplierName}</Text>
                        {product.supplierRating && (
                          <Text size={1} style={{ color: 'var(--card-fg-color)' }}>
                            {getRatingStars(product.supplierRating)}
                          </Text>
                        )}
                      </Flex>

                      {product.soldCount && (
                        <Text size={1} muted>
                          📦 {product.soldCount.toLocaleString()} sold
                        </Text>
                      )}
                      
                      {product.shippingInfo && (
                        <Text size={1} muted>
                          🚚 {product.shippingInfo.free ? 'Free Shipping' : `$${product.shippingInfo.cost} shipping`}
                        </Text>
                      )}
                    </Stack>
                    
                    {/* Import Button */}
                    <Button
                      onClick={() => importProduct(product)}
                      disabled={isImporting}
                      tone="positive"
                      text="📥 Import to Catalog"
                    />
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Card>
      )}

      {/* No Results Message */}
      {!isSearching && discoveredProducts.length === 0 && searchQuery && !error && (
        <Card padding={6} tone="default">
          <Stack space={4}>
            <Text size={6}>🔍</Text>
            <Text size={3} weight="semibold">No products found for &quot;{searchQuery}&quot;</Text>
            <Text size={2} muted>Try adjusting your search terms or filters</Text>
          </Stack>
        </Card>
      )}

      {/* Initial State */}
      {!searchQuery && discoveredProducts.length === 0 && !error && !success && (
        <Card padding={6} tone="default">
          <Stack space={4}>
            <Text size={6} style={{ color: 'var(--card-fg-color)' }}>🚀</Text>
            <Text size={3} weight="semibold">Ready to Discover Products</Text>
            <Text size={2} muted>
              Enter a search term above to find products on Alibaba
            </Text>
            <Stack space={2}>
                             <Text size={1} muted>💡 Try searching for: &quot;wireless headphones&quot;, &quot;smartphone cases&quot;, &quot;kitchen appliances&quot;</Text>
               <Text size={1} muted>🔍 Use filters to narrow down results by price, category, or supplier rating</Text>
               <Text size={1} muted>📥 Click &quot;Import to Catalog&quot; to add products with one click</Text>
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}; 