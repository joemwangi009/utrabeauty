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
  images: string[];
  url: string;
  supplierName: string;
  scrapedAt: string;
  // Additional real product details
  minOrderQuantity?: string;
  material?: string;
  color?: string;
  size?: string;
  brand?: string;
  warranty?: string;
  shippingInfo?: string;
  productSpecs?: Record<string, string>;
}

interface SearchFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'price' | 'relevance' | 'newest';
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
    sortBy: 'relevance'
  });
  const [error, setError] = useState<string | null>(null);
  const [autoFillSuccess, setAutoFillSuccess] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillProgress, setAutoFillProgress] = useState<string[]>([]);

  // Function to create a patch for a specific field
  const createFieldPatch = (fieldPath: string[], value: any) => {
    return set(value, fieldPath);
  };

  // Function to apply patches to multiple fields
  const applyFieldPatches = (patches: any[]) => {
    try {
      // Create a single PatchEvent with all patches
      const patchEvent = PatchEvent.from(patches);
      console.log('🔧 Applying patches:', patchEvent);
      
      // Apply the patches
      onChange(patchEvent);
      console.log('✅ Patches applied successfully');
      
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
      } else {
        setError(data.error || 'Failed to discover products');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectProduct = async (product: DiscoveredProduct) => {
    setSelectedProduct(product);
    setIsAutoFilling(true);
    setAutoFillProgress([]);
    
    try {
      console.log('🚀 Starting auto-fill process for:', product.title);
      console.log('🔧 Current form value:', value);
      
      // Auto-fill the product form with ALL fields using patches
      const patches = [];
      let fieldCount = 0;

      // Set title
      patches.push(createFieldPatch(['title'], product.title));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Title: ${product.title.substring(0, 30)}...`]);
      console.log('🔧 Created title patch:', product.title);
      
      // Set description with enhanced details
      let enhancedDescription = product.description;
      
      // Add additional product details to description if available
      const additionalDetails = [];
      if (product.material) additionalDetails.push(`Material: ${product.material}`);
      if (product.color) additionalDetails.push(`Color: ${product.color}`);
      if (product.size) additionalDetails.push(`Size: ${product.size}`);
      if (product.brand) additionalDetails.push(`Brand: ${product.brand}`);
      if (product.warranty) additionalDetails.push(`Warranty: ${product.warranty}`);
      if (product.shippingInfo) additionalDetails.push(`Shipping: ${product.shippingInfo}`);
      if (product.minOrderQuantity) additionalDetails.push(`Min Order: ${product.minOrderQuantity}`);
      
      if (additionalDetails.length > 0) {
        enhancedDescription += `\n\nProduct Specifications:\n${additionalDetails.join('\n')}`;
      }
      
      patches.push(createFieldPatch(['description'], enhancedDescription));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Description: Enhanced with ${additionalDetails.length} specifications`]);
      console.log('🔧 Created description patch:', enhancedDescription);
      
      // Set price (convert to number)
      const price = parseFloat(product.price.replace(/[^\d.,]/g, '')) || 0;
      patches.push(createFieldPatch(['price'], price));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Price: $${price}`]);
      console.log('🔧 Created price patch:', price);
      
      // Set supplier URL
      patches.push(createFieldPatch(['supplierUrl'], product.url));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Supplier URL: ${product.url.includes('aliexpress') ? 'AliExpress' : 'Alibaba'}`]);
      console.log('🔧 Created supplierUrl patch:', product.url);
      
      // Set supplier name
      patches.push(createFieldPatch(['supplierName'], product.supplierName));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Supplier: ${product.supplierName}`]);
      console.log('🔧 Created supplierName patch:', product.supplierName);
      
      // Set importedFromAlibaba to true
      patches.push(createFieldPatch(['importedFromAlibaba'], true));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Import Flag: Set to true`]);
      console.log('🔧 Created importFlag patch:', true);
      
      // Set stock (default to 100 for imported products)
      patches.push(createFieldPatch(['stock'], 100));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Stock: Set to 100 (default)`]);
      console.log('🔧 Created stock patch:', 100);
      
      // Set isActive to true
      patches.push(createFieldPatch(['isActive'], true));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Active Status: Set to true`]);
      console.log('🔧 Created active patch:', true);
      
      // Generate and set slug from title
      const slug = product.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 96);
      
      patches.push(createFieldPatch(['slug'], {
        _type: 'slug',
        current: slug
      }));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Slug: Generated "${slug}"`]);
      console.log('🔧 Created slug patch:', slug);
      
      // Set tags based on product description, title, and specifications
      const tags = [];
      const text = `${product.title} ${product.description}`.toLowerCase();
      
      // Common product tags
      if (text.includes('wireless') || text.includes('bluetooth')) tags.push('wireless');
      if (text.includes('waterproof') || text.includes('water-resistant')) tags.push('waterproof');
      if (text.includes('portable') || text.includes('travel')) tags.push('portable');
      if (text.includes('smart') || text.includes('ai')) tags.push('smart');
      if (text.includes('eco') || text.includes('green')) tags.push('eco-friendly');
      if (text.includes('premium') || text.includes('luxury')) tags.push('premium');
      if (text.includes('budget') || text.includes('affordable')) tags.push('budget-friendly');
      
      // Add category-based tags
      if (text.includes('phone') || text.includes('smartphone')) tags.push('mobile', 'electronics');
      if (text.includes('laptop') || text.includes('computer')) tags.push('computing', 'electronics');
      if (text.includes('headphone') || text.includes('earphone')) tags.push('audio', 'electronics');
      if (text.includes('watch') || text.includes('clock')) tags.push('wearable', 'electronics');
      if (text.includes('camera') || text.includes('photo')) tags.push('photography', 'electronics');
      if (text.includes('game') || text.includes('gaming')) tags.push('gaming', 'entertainment');
      
      // Add specification-based tags
      if (product.material) {
        const material = product.material.toLowerCase();
        if (material.includes('plastic')) tags.push('plastic');
        if (material.includes('metal') || material.includes('aluminum') || material.includes('steel')) tags.push('metal');
        if (material.includes('wood')) tags.push('wood');
        if (material.includes('leather')) tags.push('leather');
        if (material.includes('fabric') || text.includes('cotton')) tags.push('fabric');
        if (material.includes('glass')) tags.push('glass');
        if (material.includes('ceramic')) tags.push('ceramic');
      }
      
      if (product.color) {
        const color = product.color.toLowerCase();
        if (color.includes('black')) tags.push('black');
        if (color.includes('white')) tags.push('white');
        if (color.includes('red')) tags.push('red');
        if (color.includes('blue')) tags.push('blue');
        if (color.includes('green')) tags.push('green');
        if (color.includes('yellow')) tags.push('yellow');
        if (color.includes('pink')) tags.push('pink');
        if (color.includes('purple')) tags.push('purple');
        if (color.includes('orange')) tags.push('orange');
        if (color.includes('brown')) tags.push('brown');
        if (color.includes('gray') || color.includes('grey')) tags.push('gray');
        if (color.includes('gold')) tags.push('gold');
        if (color.includes('silver')) tags.push('silver');
      }
      
      if (product.brand) {
        tags.push(product.brand.toLowerCase().replace(/\s+/g, '-'));
      }
      
      // Add warranty and certification tags
      if (product.warranty && product.warranty.toLowerCase().includes('warranty')) tags.push('warranty');
      if (product.productSpecs) {
        Object.values(product.productSpecs).forEach(spec => {
          if (spec && spec.toLowerCase().includes('certified')) tags.push('certified');
          if (spec && spec.toLowerCase().includes('iso')) tags.push('iso-certified');
          if (spec && spec.toLowerCase().includes('ce')) tags.push('ce-marked');
          if (spec && spec.toLowerCase().includes('fcc')) tags.push('fcc-approved');
        });
      }
      
      // Remove duplicates and limit to 15 tags
      const uniqueTags = [...new Set(tags)].slice(0, 15);
      patches.push(createFieldPatch(['tags'], uniqueTags));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Tags: Generated ${uniqueTags.length} smart tags`]);
      console.log('🔧 Created tags patch:', uniqueTags);
      
      // Set import metadata
      patches.push(createFieldPatch(['importMetadata'], {
        importedFrom: product.url.includes('aliexpress.com') ? 'aliexpress' : 'alibaba',
        importedAt: new Date().toISOString(),
        originalUrl: product.url
      }));
      fieldCount++;
      setAutoFillProgress(prev => [...prev, `✅ Import Metadata: Complete tracking info`]);
      console.log('🔧 Created metadata patch');
      
      // Set creation and update timestamps
      const now = new Date().toISOString();
      patches.push(createFieldPatch(['createdAt'], now));
      patches.push(createFieldPatch(['updatedAt'], now));
      fieldCount += 2;
      setAutoFillProgress(prev => [...prev, `✅ Timestamps: Created & Updated set`]);
      console.log('🔧 Created timestamp patches:', now);

      // Update the productDiscovery field value using the field-level onChange
      patches.push(createFieldPatch(['productDiscovery'], {
        searchQuery: searchQuery,
        selectedProduct: {
          title: product.title,
          url: product.url,
          price: product.price
        }
      }));

      console.log('📦 All patches created:', patches);
      console.log('🎯 About to apply patches via onChange...');

      // Apply all patches
      const success = applyFieldPatches(patches);
      
      if (success) {
        // Show success message with field count
        setIsAutoFilling(false);
        setAutoFillSuccess(true);
        setTimeout(() => setAutoFillSuccess(false), 5000); // Hide after 5 seconds
        
        console.log(`✅ Auto-fill process completed for ${fieldCount} fields:`, {
          title: product.title,
          description: enhancedDescription,
          price: price,
          supplierUrl: product.url,
          supplierName: product.supplierName,
          stock: 100,
          isActive: true,
          slug: slug,
          tags: uniqueTags,
          importedFromAlibaba: true,
          totalFields: fieldCount
        });
      } else {
        throw new Error('Failed to apply patches');
      }

    } catch (error) {
      console.error('❌ Auto-fill error:', error);
      setError('Failed to auto-fill product form');
      setIsAutoFilling(false);
    }
  };

  const clearSelection = () => {
    setSelectedProduct(null);
    
    // Clear all auto-filled fields using patches
    const clearPatches = [
      unset(['title']),
      unset(['description']),
      unset(['price']),
      unset(['supplierUrl']),
      unset(['supplierName']),
      unset(['importedFromAlibaba']),
      unset(['stock']),
      unset(['isActive']),
      unset(['slug']),
      unset(['tags']),
      unset(['importMetadata']),
      unset(['createdAt']),
      unset(['updatedAt'])
    ];
    
    // Apply clear patches
    const success = applyFieldPatches(clearPatches);
    
    if (success) {
      // Clear the productDiscovery field using field-level onChange
      onChange(PatchEvent.from([unset(['productDiscovery'])]));
      console.log('🧹 Cleared all auto-filled product fields');
    } else {
      console.error('❌ Failed to clear fields');
    }
  };

  // Function to verify form values
  const verifyFormValues = () => {
    console.log('🔍 Verifying form values:');
    // This function is no longer directly applicable as formValues is removed.
    // The onChange prop is the primary way to interact with the form.
    // We can log the current value of the 'productDiscovery' field if needed.
    // For now, we'll just log the current value of the 'productDiscovery' field.
    const currentProductDiscovery = value?.productDiscovery;
    if (currentProductDiscovery) {
      console.log('📋 Current ProductDiscovery Value:', currentProductDiscovery);
    } else {
      console.log('📋 Current ProductDiscovery Value: Not set');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
          🔍 Discover Alibaba Products
        </h3>
        
        {/* Search Input */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search for products (e.g., 'wireless headphones', 'smartphone case')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button 
            onClick={searchProducts}
            disabled={isSearching}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSearching ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          <button 
            onClick={() => {
              // Test auto-fill with sample data
              const testProduct: DiscoveredProduct = {
                id: 'test-1',
                title: 'Test Wireless Headphones',
                description: 'High-quality wireless Bluetooth headphones with noise cancellation',
                price: '29.99',
                images: ['https://via.placeholder.com/150'],
                url: 'https://alibaba.com/test-product',
                supplierName: 'Test Supplier',
                scrapedAt: new Date().toISOString(),
                material: 'Plastic',
                color: 'Black',
                size: 'One Size',
                brand: 'TestBrand'
              };
              selectProduct(testProduct);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🧪 Test Auto-Fill
          </button>
        </div>

        {/* Test Buttons */}
        <div style={{ 
          marginBottom: '15px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', color: '#495057' }}>
            🧪 Test & Debug:
          </h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                console.log('🧪 Test button clicked');
                console.log('🔍 Current value:', value);
                
                // Test a simple patch using the new approach
                try {
                  const testPatch = createFieldPatch(['title'], '🧪 TEST TITLE FROM BUTTON');
                  console.log('🧪 Test patch created:', testPatch);
                  
                  const success = applyFieldPatches([testPatch]);
                  if (success) {
                    console.log('🧪 Test patch applied successfully');
                  } else {
                    console.log('🧪 Test patch failed to apply');
                  }
                } catch (error) {
                  console.error('🧪 Test failed:', error);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🧪 Test Patch Application
            </button>
            
            <button
              onClick={() => {
                console.log('🔍 Verify button clicked');
                console.log('📋 Current form state:', {
                  onChange: typeof onChange,
                  value: value,
                  selectedProduct: selectedProduct
                });
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔍 Verify Form State
            </button>
          </div>
        </div>

        {/* Current Form Values Display */}
        <div style={{ 
          marginBottom: '15px', 
          padding: '15px', 
          backgroundColor: 'white', 
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', color: '#495057' }}>
            📋 Current Form State:
          </h4>
          <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.4' }}>
            <div><strong>Search Query:</strong> {searchQuery || 'Not set'}</div>
            <div><strong>Products Found:</strong> {discoveredProducts.length}</div>
            <div><strong>Selected Product:</strong> {selectedProduct ? selectedProduct.title : 'None'}</div>
            <div><strong>Auto-fill Status:</strong> {isAutoFilling ? 'In Progress' : 'Ready'}</div>
            <div><strong>ProductDiscovery Value:</strong> {value?.productDiscovery ? 'Set' : 'Not set'}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Garden</option>
            <option value="beauty">Beauty & Health</option>
            <option value="sports">Sports & Outdoor</option>
          </select>
          
          <input
            type="text"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          
          <input
            type="text"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="relevance">Relevance</option>
            <option value="price">Price</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px', 
          color: '#721c24',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: 'white', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'inline-block', marginRight: '10px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '2px solid #f3f3f3', 
              borderTop: '2px solid #007bff', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
          </div>
          Searching Alibaba for products...
        </div>
      )}

      {/* Search Results */}
      {discoveredProducts.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              Found {discoveredProducts.length} Products
            </h4>
            {selectedProduct && (
              <button 
                onClick={clearSelection}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Clear Selection
              </button>
            )}
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '15px' 
          }}>
            {discoveredProducts.map((product) => (
              <div 
                key={product.id} 
                style={{ 
                  border: selectedProduct?.id === product.id ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '15px',
                  cursor: 'pointer',
                  backgroundColor: selectedProduct?.id === product.id ? '#f8f9ff' : 'white',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => selectProduct(product)}
              >
                {/* Product Image */}
                {product.images[0] && (
                  <div style={{ 
                    height: '120px', 
                    overflow: 'hidden', 
                    marginBottom: '10px',
                    borderRadius: '4px'
                  }}>
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  </div>
                )}
                
                {/* Product Info */}
                <div>
                  <h5 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.title}
                  </h5>
                  
                  <p style={{
                    margin: '0 0 10px 0',
                    fontSize: '12px',
                    color: '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.4'
                  }}>
                    {product.description}
                  </p>
                  
                  {/* Additional Specifications */}
                  {(product.material || product.color || product.size || product.brand) && (
                    <div style={{
                      margin: '0 0 10px 0',
                      fontSize: '11px',
                      color: '#888'
                    }}>
                      {product.material && <span style={{ marginRight: '8px' }}>📦 {product.material}</span>}
                      {product.color && <span style={{ marginRight: '8px' }}>🎨 {product.color}</span>}
                      {product.size && <span style={{ marginRight: '8px' }}>📏 {product.size}</span>}
                      {product.brand && <span style={{ marginRight: '8px' }}>🏷️ {product.brand}</span>}
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <span style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      ${product.price}
                    </span>
                    <span style={{ fontSize: '11px', color: '#666' }}>
                      {product.supplierName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Product Summary */}
      {selectedProduct && (
        <div style={{ 
          backgroundColor: '#e7f3ff', 
          padding: '20px', 
          borderRadius: '4px',
          border: '1px solid #b3d9ff'
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#0056b3' }}>
            ✅ Selected Product - All Fields Will Be Auto-Filled
          </h4>
          <div style={{ fontSize: '14px', color: '#333' }}>
            <p style={{ margin: '5px 0', fontWeight: '600' }}>{selectedProduct.title}</p>
            <p style={{ margin: '5px 0' }}>Price: ${selectedProduct.price}</p>
            <p style={{ margin: '5px 0' }}>Supplier: {selectedProduct.supplierName}</p>
            <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
              URL: {selectedProduct.url}
            </p>
            
            {/* Additional Specifications */}
            {(selectedProduct.material || selectedProduct.color || selectedProduct.size || selectedProduct.brand) && (
              <div style={{ margin: '10px 0', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                <p style={{ margin: '5px 0', fontWeight: '600', fontSize: '12px', color: '#0056b3' }}>
                  📋 Additional Details to be Auto-Filled:
                </p>
                {selectedProduct.material && <p style={{ margin: '3px 0', fontSize: '12px' }}>📦 Material: {selectedProduct.material}</p>}
                {selectedProduct.color && <p style={{ margin: '3px 0', fontSize: '12px' }}>🎨 Color: {selectedProduct.color}</p>}
                {selectedProduct.size && <p style={{ margin: '3px 0', fontSize: '12px' }}>📏 Size: {selectedProduct.size}</p>}
                {selectedProduct.brand && <p style={{ margin: '3px 0', fontSize: '12px' }}>🏷️ Brand: {selectedProduct.brand}</p>}
                {selectedProduct.warranty && <p style={{ margin: '3px 0', fontSize: '12px' }}>🛡️ Warranty: {selectedProduct.warranty}</p>}
                {selectedProduct.minOrderQuantity && <p style={{ margin: '3px 0', fontSize: '12px' }}>📦 Min Order: {selectedProduct.minOrderQuantity}</p>}
              </div>
            )}
            
            <p style={{ margin: '10px 0', fontSize: '12px', color: '#0056b3', fontWeight: '600' }}>
              ✨ Auto-filling: title, description, price, supplier info, stock (100), tags, slug, timestamps, and more!
            </p>
            
            {/* Field Count */}
            <div style={{ 
              margin: '10px 0', 
              padding: '8px', 
              backgroundColor: '#d4edda', 
              borderRadius: '4px',
              border: '1px solid #c3e6cb'
            }}>
              <p style={{ margin: '0', fontSize: '11px', color: '#155724', fontWeight: '600' }}>
                🔢 Total Fields to Auto-Fill: 15+ fields including all specifications, tags, and metadata
              </p>
            </div>
            
            {/* Auto-Fill Preview */}
            <div style={{ 
              margin: '10px 0', 
              padding: '12px', 
              backgroundColor: '#fff3cd', 
              borderRadius: '4px',
              border: '1px solid #ffeaa7'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#856404', fontWeight: '600' }}>
                📋 Auto-Fill Preview:
              </p>
              <div style={{ fontSize: '11px', color: '#856404', lineHeight: '1.4' }}>
                <div>✅ <strong>Title:</strong> {selectedProduct.title}</div>
                <div>✅ <strong>Description:</strong> Enhanced with specifications</div>
                <div>✅ <strong>Price:</strong> ${selectedProduct.price}</div>
                <div>✅ <strong>Stock:</strong> 100 (default)</div>
                <div>✅ <strong>Active:</strong> Yes</div>
                <div>✅ <strong>Slug:</strong> Auto-generated</div>
                <div>✅ <strong>Tags:</strong> Smart tags based on content</div>
                <div>✅ <strong>Supplier URL:</strong> {selectedProduct.url}</div>
                <div>✅ <strong>Supplier Name:</strong> {selectedProduct.supplierName}</div>
                <div>✅ <strong>Import Metadata:</strong> Complete tracking</div>
                <div>✅ <strong>Timestamps:</strong> Created/Updated</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Fill Success Message */}
      {autoFillSuccess && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '4px', 
          color: '#155724',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <div>
              <strong>Product Auto-Filled Successfully!</strong>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>
                All product fields have been automatically populated with real-time data from Alibaba.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Fill Progress */}
      {isAutoFilling && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e9ecef', 
          border: '1px solid #dee2e6', 
          borderRadius: '4px', 
          marginBottom: '15px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h5 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
              Auto-Filling in Progress:
            </h5>
            <span style={{ 
              fontSize: '12px', 
              color: '#007bff', 
              fontWeight: '600',
              backgroundColor: '#fff',
              padding: '4px 8px',
              borderRadius: '12px',
              border: '1px solid #007bff'
            }}>
              {autoFillProgress.length} / 15+ fields
            </span>
          </div>
          <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
            {autoFillProgress.map((item, index) => (
              <li key={index} style={{ 
                marginBottom: '5px', 
                fontSize: '13px', 
                color: '#555',
                lineHeight: '1.4'
              }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Debug Information */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h4 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#495057' }}>
            🐛 Debug Information:
          </h4>
          <button 
            onClick={verifyFormValues}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            🔍 Verify Values
          </button>
        </div>
        <div style={{ fontSize: '11px', color: '#6c757d', lineHeight: '1.4' }}>
          <div><strong>Search Query:</strong> {searchQuery || 'None'}</div>
          <div><strong>Products Found:</strong> {discoveredProducts.length}</div>
          <div><strong>Selected Product:</strong> {selectedProduct ? selectedProduct.title : 'None'}</div>
          <div><strong>Auto-fill Status:</strong> {isAutoFilling ? 'In Progress' : 'Ready'}</div>
          <div><strong>ProductDiscovery Value:</strong> {value?.productDiscovery ? 'Set' : 'Not set'}</div>
          <div><strong>Auto-fill Progress:</strong> {autoFillProgress.length} / 15+ fields</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}; 