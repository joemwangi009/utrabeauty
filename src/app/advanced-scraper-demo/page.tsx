'use client';

import React, { useState } from 'react';

interface ScrapingResult {
  success: boolean;
  products?: any[];
  error?: string;
  total?: number;
  platform?: string;
  strategy?: string;
  timestamp?: string;
}

export default function AdvancedScraperDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [platform, setPlatform] = useState<'alibaba' | 'aliexpress' | 'amazon'>('alibaba');
  const [strategy, setStrategy] = useState<'stealth' | 'mobile' | 'api_interception'>('stealth');
  const [useProxy, setUseProxy] = useState(false);
  const [simulateHuman, setSimulateHuman] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [result, setResult] = useState<ScrapingResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startScraping = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setIsScraping(true);
    setResult(null);
    setLogs([]);

    addLog('🚀 Starting advanced anti-detection scraping...');
    addLog(`📱 Platform: ${platform}`);
    addLog(`🎯 Strategy: ${strategy}`);
    addLog(`🌐 Use Proxy: ${useProxy}`);
    addLog(`🧑 Simulate Human: ${simulateHuman}`);

    try {
      const response = await fetch('/api/discover-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          platform,
          strategy,
          useProxy,
          simulateHuman
        }),
      });

      const data: ScrapingResult = await response.json();

      if (data.success) {
        addLog(`✅ Scraping completed successfully!`);
        addLog(`📦 Found ${data.total} products`);
        addLog(`🎯 Used strategy: ${data.strategy}`);
        setResult(data);
      } else {
        addLog(`❌ Scraping failed: ${data.error}`);
        setResult(data);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Network error: ${errorMessage}`);
      setResult({ success: false, error: errorMessage });
    } finally {
      setIsScraping(false);
      addLog('🏁 Scraping session ended');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Advanced Anti-Detection Scraper Demo
          </h1>
          <p className="text-xl text-gray-600">
            Experience the power of mobile emulation, proxy rotation, and human behavior simulation
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">⚙️ Scraping Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search Query */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search Query
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., wireless headphones, smartphone cases"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🌐 Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="alibaba">Alibaba</option>
                <option value="aliexpress">AliExpress</option>
                <option value="amazon">Amazon</option>
              </select>
            </div>

            {/* Strategy Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Scraping Strategy
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="stealth">Stealth Mode</option>
                <option value="mobile">Mobile Emulation</option>
                <option value="api_interception">API Interception</option>
              </select>
            </div>

            {/* Proxy Usage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🌐 Proxy Management
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useProxy"
                  checked={useProxy}
                  onChange={(e) => setUseProxy(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="useProxy" className="ml-2 text-sm text-gray-700">
                  Use IP Rotation & Proxies
                </label>
              </div>
            </div>

            {/* Human Behavior Simulation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🧑 Human Behavior
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="simulateHuman"
                  checked={simulateHuman}
                  onChange={(e) => setSimulateHuman(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="simulateHuman" className="ml-2 text-sm text-gray-700">
                  Simulate Human Behavior
                </label>
              </div>
            </div>

            {/* Start Button */}
            <div className="md:col-span-2 lg:col-span-1">
              <button
                onClick={startScraping}
                disabled={isScraping || !searchQuery.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {isScraping ? '🔄 Scraping...' : '🚀 Start Scraping'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              📊 Scraping Results
            </h2>
            
            {result.success ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.total}</div>
                    <div className="text-green-700">Products Found</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{result.strategy}</div>
                    <div className="text-blue-700">Strategy Used</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{result.platform}</div>
                    <div className="text-purple-700">Platform</div>
                  </div>
                </div>

                {result.products && result.products.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Discovered Products</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.products.slice(0, 6).map((product: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                            {product.title}
                          </h4>
                          <div className="text-lg font-bold text-blue-600 mb-2">
                            {product.price}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {product.supplierName}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Confidence: {product.confidence}%</span>
                            <span className={`px-2 py-1 rounded ${
                              product.dataQuality === 'excellent' ? 'bg-green-100 text-green-800' :
                              product.dataQuality === 'good' ? 'bg-blue-100 text-blue-800' :
                              product.dataQuality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.dataQuality}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">❌</span>
                  <span className="text-red-800 font-medium">Scraping Failed</span>
                </div>
                <p className="text-red-700 mt-2">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Live Logs Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">📝 Live Scraping Logs</h2>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              🗑️ Clear Logs
            </button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Start scraping to see live updates...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Emulation</h3>
            <p className="text-gray-600">
              Emulate iPhone, Android, and iPad devices with realistic touch gestures and mobile behaviors.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Proxy Rotation</h3>
            <p className="text-gray-600">
              Automatic IP rotation and proxy management to avoid detection and rate limiting.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">🧑</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Human Behavior</h3>
            <p className="text-gray-600">
              Simulate realistic mouse movements, scrolling patterns, and typing behaviors.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Strategies</h3>
            <p className="text-gray-600">
              Intelligent fallback between stealth, mobile, and API interception strategies.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Management</h3>
            <p className="text-gray-600">
              Advanced session handling with cookie management and user agent rotation.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Validation</h3>
            <p className="text-gray-600">
              Comprehensive data quality assessment with confidence scoring and validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 