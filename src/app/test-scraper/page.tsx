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
}

export default function TestScraper() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<DiscoveredProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testScraper = async () => {
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
        console.log('Scraped products:', data.products);
      } else {
        setError(data.error || 'Failed to discover products');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Scraping error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🧪 Test Product Scraper
      </h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        justifyContent: 'center'
      }}>
        <input
          type="text"
          placeholder="Enter search term (e.g., headphones, phone, dress)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && testScraper()}
          style={{
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            minWidth: '300px'
          }}
        />
        <button 
          onClick={testScraper}
          disabled={isLoading || !query.trim()}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '🔍 Searching...' : '🔍 Search Products'}
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
            borderTop: '4px solid #007bff', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <br />
          Searching for products... This may take a few moments.
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
            ✅ Found {products.length} Products
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {products.map((product) => (
              <div 
                key={product.id} 
                style={{ 
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {/* Product Image */}
                {product.images[0] && (
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
                        target.parentElement!.innerHTML = '🖼️ Image not available';
                      }}
                    />
                  </div>
                )}
                
                {/* Product Info */}
                <h3 style={{ 
                  margin: '0 0 10px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  lineHeight: '1.4',
                  minHeight: '44px'
                }}>
                  {product.title}
                </h3>
                
                <p style={{
                  margin: '0 0 15px 0',
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5',
                  minHeight: '42px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {product.description}
                </p>
                
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

                <div style={{ fontSize: '11px', color: '#999' }}>
                  🔗 <a href={product.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                    View Product
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