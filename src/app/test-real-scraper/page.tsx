'use client';

import { useState } from 'react';

interface DiscoveredProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  url: string;
  supplierName: string;
  scrapedAt: string;
  minOrderQuantity?: string;
  material?: string;
  color?: string;
  size?: string;
  brand?: string;
  warranty?: string;
  shippingInfo?: string;
  productSpecs?: Record<string, string>;
}

export default function TestRealScraper() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<DiscoveredProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testRealScraper = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setProducts([]);

    try {
      const response = await fetch('/api/discover-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (data.success && data.products) {
        setProducts(data.products);
        console.log('Real scraped products:', data.products);
      } else {
        setError(data.error || 'Failed to discover real products');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Real scraping error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🔍 **REAL ALIBABA SCRAPER TEST** - Extract Actual Products with Real Details
      </h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        justifyContent: 'center'
      }}>
        <input
          type="text"
          placeholder="Search for REAL products (e.g., wireless headphones, laptop, dress)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && testRealScraper()}
          style={{
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #007bff',
            borderRadius: '8px',
            minWidth: '400px'
          }}
        />
        <button 
          onClick={testRealScraper}
          disabled={isLoading || !query.trim()}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '🔍 Scraping REAL Products...' : '🔍 Scrape REAL Products'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '8px', 
          color: '#721c24',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          ❌ {error}
        </div>
      )}

      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          fontSize: '18px',
          color: '#666'
        }}>
          <div style={{ 
            display: 'inline-block', 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #28a745', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <br />
          🔍 Scraping REAL Alibaba products... This may take 10-20 seconds for genuine data.
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#28a745' }}>
            ✅ Found {products.length} REAL Alibaba Products
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '20px' 
          }}>
            {products.map((product) => (
              <div 
                key={product.id} 
                style={{ 
                  border: '2px solid #28a745',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)'
                }}
              >
                {/* Product Images */}
                {product.images && product.images.length > 0 && (
                  <div style={{ 
                    height: '200px', 
                    overflow: 'hidden', 
                    marginBottom: '15px',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain' 
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '🖼️ Real Product Image';
                      }}
                    />
                  </div>
                )}
                
                {/* Product Title */}
                <h3 style={{ 
                  margin: '0 0 10px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  lineHeight: '1.4',
                  color: '#28a745'
                }}>
                  {product.title}
                </h3>
                
                {/* Product Description */}
                <p style={{
                  margin: '0 0 15px 0',
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5',
                  minHeight: '42px'
                }}>
                  {product.description}
                </p>
                
                {/* Price and Supplier */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    💰 ${product.price}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    backgroundColor: '#f8f9fa',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {product.supplierName}
                  </span>
                </div>

                {/* Detailed Product Specifications */}
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#28a745' }}>
                    📋 Product Details
                  </h4>
                  
                  {product.minOrderQuantity && (
                    <div style={{ marginBottom: '5px', fontSize: '12px' }}>
                      <strong>Min Order:</strong> {product.minOrderQuantity}
                    </div>
                  )}
                  
                  {product.material && (
                    <div style={{ marginBottom: '5px', fontSize: '12px' }}>
                      <strong>Material:</strong> {product.material}
                    </div>
                  )}
                  
                  {product.color && (
                    <div style={{ marginBottom: '5px', fontSize: '12px' }}>
                      <strong>Color:</strong> {product.color}
                    </div>
                  )}
                  
                  {product.size && (
                    <div style={{ marginBottom: '5px', fontSize: '12px' }}>
                      <strong>Size:</strong> {product.size}
                    </div>
                  )}
                  
                  {product.brand && (
                    <div style={{ marginBottom: '5px', fontSize: '12px' }}>
                      <strong>Brand:</strong> {product.brand}
                    </div>
                  )}
                  
                  {product.warranty && (
                    <div style={{ marginBottom: '5px', fontSize: '12px' }}>
                      <strong>Warranty:</strong> {product.warranty}
                    </div>
                  )}
                </div>

                {/* Product URL */}
                <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
                  🔗 <a href={product.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                    View REAL Product on Alibaba
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 