'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ScrapedProduct {
  title: string;
  description: string;
  price: string;
  images: string[];
  scrapedAt: string;
}

interface ScrapingResult {
  success: boolean;
  data?: ScrapedProduct;
  message?: string;
  error?: string;
  details?: string;
}

export default function ScrapeTestPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScrapingResult | null>(null);

  const handleScrape = async () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/scrape-alibaba?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to scrape',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🔄 Alibaba Product Scraper</h1>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Enter an Alibaba or AliExpress product URL</li>
          <li>Click &quot;Scrape Product&quot; to extract product information</li>
          <li>View the extracted data below</li>
        </ol>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Alibaba/AliExpress product URL..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleScrape}
            disabled={isLoading || !url}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '🔄 Scraping...' : '🚀 Scrape Product'}
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Example URLs: alibaba.com/product-detail/... or aliexpress.com/item/...
        </p>
      </div>

      {isLoading && (
        <div className="bg-blue-50 p-6 rounded-lg mb-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800">Scraping product data... This may take a few moments.</p>
        </div>
      )}

      {result && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {result.success ? (
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">✅ Scraping Successful!</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Product Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded">{result.data?.title || 'No title found'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <p className="text-green-600 font-semibold text-lg bg-gray-50 p-3 rounded">
                        ${result.data?.price || 'No price found'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                        {result.data?.description || 'No description found'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Scraped At</label>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded">
                        {result.data?.scrapedAt ? new Date(result.data.scrapedAt).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Product Images ({result.data?.images.length || 0})</h3>
                  
                  {result.data?.images && result.data.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {result.data.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            width={128}
                            height={96}
                            className="w-full h-32 object-cover rounded border hover:scale-105 transition-transform cursor-pointer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <a
                              href={image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="opacity-0 group-hover:opacity-100 bg-white text-black px-3 py-1 rounded text-sm font-medium transition-opacity"
                            >
                              View Full
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 bg-gray-50 p-3 rounded">No images found</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  <strong>Success!</strong> Product data has been successfully scraped. 
                  You can now use this information to import the product into your store.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Scraping Failed</h2>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 mb-2">
                  <strong>Error:</strong> {result.error}
                </p>
                {result.details && (
                  <p className="text-red-700 text-sm">
                    <strong>Details:</strong> {result.details}
                  </p>
                )}
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <strong>Troubleshooting:</strong>
                </p>
                <ul className="list-disc list-inside mt-2 text-yellow-700 text-sm">
                  <li>Make sure the URL is valid and accessible</li>
                  <li>Check if the product page is still available</li>
                  <li>Try a different Alibaba/AliExpress product URL</li>
                  <li>Ensure the URL is from alibaba.com or aliexpress.com</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg mt-6">
        <h3 className="text-lg font-semibold mb-3">⚠️ Important Notes</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
          <li>This tool is for educational and legitimate business purposes only</li>
          <li>Respect website terms of service and robots.txt</li>
          <li>Use reasonable scraping intervals to avoid overwhelming servers</li>
          <li>Some product pages may have anti-scraping measures</li>
          <li>Image URLs may expire or become inaccessible over time</li>
        </ul>
      </div>
    </div>
  );
} 