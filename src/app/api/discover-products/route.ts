import { NextRequest, NextResponse } from 'next/server';
import { AdvancedScraper } from '../../../lib/advanced-scraper';

/**
 * 🚀 ADVANCED ANTI-DETECTION Product Discovery API
 * 
 * FEATURES:
 * - Mobile device emulation (iPhone, Android, iPad)
 * - IP rotation & proxy management
 * - Human behavior simulation
 * - Multiple scraping strategies with intelligent fallback
 * - Session management & user agent rotation
 * - Advanced data validation & quality assurance
 * - Rate limiting & queue management
 * - Production-grade error handling
 */

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
  confidence: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface SearchFilters {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: 'price' | 'relevance' | 'newest' | 'rating' | 'sold';
  supplierRating?: number;
  minOrder?: number;
}

interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  platform?: 'alibaba' | 'aliexpress' | 'amazon';
  strategy?: 'stealth' | 'mobile' | 'api_interception';
  useProxy?: boolean;
  simulateHuman?: boolean;
}

export async function POST(request: NextRequest) {
  let query: string = '';
  let filters: SearchFilters = {};
  let platform: 'alibaba' | 'aliexpress' | 'amazon' = 'alibaba';
  let strategy: 'stealth' | 'mobile' | 'api_interception' = 'stealth';
  let useProxy = false;
  let simulateHuman = true;
  
  try {
    const body: SearchRequest = await request.json();
    query = body.query;
    filters = body.filters || {};
    platform = body.platform || 'alibaba';
    strategy = body.strategy || 'stealth';
    useProxy = body.useProxy || false;
    simulateHuman = body.simulateHuman !== false;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting ADVANCED anti-detection scraping for: "${query}"`);
    console.log(`📱 Platform: ${platform}`);
    console.log(`🎯 Strategy: ${strategy}`);
    console.log(`🌐 Use Proxy: ${useProxy}`);
    console.log(`🧑 Simulate Human: ${simulateHuman}`);

    // Initialize advanced scraper
    const scraper = new AdvancedScraper();
    await scraper.initialize();

    // Generate search URLs based on platform
    const searchUrls = generateSearchUrls(query, platform, filters);
    
    const products: DiscoveredProduct[] = [];
    let totalAttempts = 0;
    const maxAttempts = 3;

    // Try each search URL with different strategies
    for (const searchUrl of searchUrls) {
      if (totalAttempts >= maxAttempts) break;
      
      try {
        console.log(`🌐 Attempting to scrape: ${searchUrl}`);
        
        const result = await scraper.scrapeProducts(searchUrl, platform, {
          strategy,
          useProxy,
          simulateHuman,
          maxRetries: 2
        });

        if (result.success && result.data) {
          // Process and validate the scraped data
          const processedProducts = await processScrapedData(result.data, platform, searchUrl);
          products.push(...processedProducts);
          
          console.log(`✅ Successfully scraped ${processedProducts.length} products from ${searchUrl}`);
          break; // Success, no need to try other URLs
        } else {
          console.log(`⚠️ Failed to scrape from ${searchUrl}: ${result.error}`);
          totalAttempts++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error scraping from ${searchUrl}:`, errorMessage);
        totalAttempts++;
      }
    }

    // Close scraper
    await scraper.close();

    if (products.length > 0) {
      // Sort products by relevance and quality
      products.sort((a, b) => {
        // First by confidence
        if (a.confidence !== b.confidence) {
          return b.confidence - a.confidence;
        }
        // Then by data quality
        const qualityOrder = { excellent: 4, good: 3, fair: 2, poor: 1 };
        return qualityOrder[a.dataQuality] - qualityOrder[b.dataQuality];
      });

      console.log(`🎉 Successfully discovered ${products.length} products with advanced anti-detection`);
      
      return NextResponse.json({
        success: true,
        products,
        total: products.length,
        platform,
        strategy,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No products found with any scraping strategy',
        total: 0,
        platform,
        strategy,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ ADVANCED scraping failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: `Advanced scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        total: 0,
        platform,
        strategy,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Generate search URLs based on platform and filters
 */
function generateSearchUrls(
  query: string,
  platform: string,
  filters: SearchFilters
): string[] {
  const encodedQuery = encodeURIComponent(query);
  const urls: string[] = [];

  switch (platform) {
    case 'alibaba':
      urls.push(
        `https://www.alibaba.com/trade/search?SearchText=${encodedQuery}`,
        `https://www.alibaba.com/wholesale?SearchText=${encodedQuery}`,
        `https://www.alibaba.com/products/${encodedQuery}.html`
      );
      break;
    
    case 'aliexpress':
      urls.push(
        `https://www.aliexpress.com/wholesale?SearchText=${encodedQuery}`,
        `https://www.aliexpress.com/products/${encodedQuery}.html`
      );
      break;
    
    case 'amazon':
      urls.push(
        `https://www.amazon.com/s?k=${encodedQuery}`,
        `https://www.amazon.co.uk/s?k=${encodedQuery}`
      );
      break;
    
    default:
      urls.push(`https://www.alibaba.com/trade/search?SearchText=${encodedQuery}`);
  }

  return urls;
}

/**
 * Process and validate scraped data
 */
async function processScrapedData(
  rawData: any,
  platform: string,
  sourceUrl: string
): Promise<DiscoveredProduct[]> {
  const products: DiscoveredProduct[] = [];

  try {
    // Handle different data structures from different platforms
    let productList: any[] = [];

    if (Array.isArray(rawData)) {
      productList = rawData;
    } else if (rawData.products && Array.isArray(rawData.products)) {
      productList = rawData.products;
    } else if (rawData.items && Array.isArray(rawData.items)) {
      productList = rawData.items;
    } else {
      // Single product
      productList = [rawData];
    }

    for (const rawProduct of productList) {
      try {
        const processedProduct = await processSingleProduct(rawProduct, platform, sourceUrl);
        if (processedProduct) {
          products.push(processedProduct);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`⚠️ Failed to process product:`, errorMessage);
        continue;
      }
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error processing scraped data:', errorMessage);
  }

  return products;
}

/**
 * Process a single product
 */
async function processSingleProduct(
  rawProduct: any,
  platform: string,
  sourceUrl: string
): Promise<DiscoveredProduct | null> {
  try {
    // Extract basic product information
    const product: DiscoveredProduct = {
      id: generateProductId(rawProduct, platform),
      title: extractTitle(rawProduct, platform) || 'Unknown Product',
      description: extractDescription(rawProduct, platform) || 'No description available',
      price: extractPrice(rawProduct, platform) || '0',
      originalPrice: extractOriginalPrice(rawProduct, platform) || undefined,
      images: extractImages(rawProduct, platform) || [],
      url: extractUrl(rawProduct, platform) || sourceUrl,
      supplierName: extractSupplierName(rawProduct, platform) || 'Unknown Supplier',
      supplierRating: extractSupplierRating(rawProduct, platform) || undefined,
      productRating: extractProductRating(rawProduct, platform) || undefined,
      soldCount: extractSoldCount(rawProduct, platform) || undefined,
      minOrderQuantity: extractMinOrderQuantity(rawProduct, platform) || undefined,
      material: extractMaterial(rawProduct, platform) || undefined,
      color: extractColor(rawProduct, platform) || undefined,
      size: extractSize(rawProduct, platform) || undefined,
      brand: extractBrand(rawProduct, platform) || undefined,
      warranty: extractWarranty(rawProduct, platform) || undefined,
      shippingInfo: extractShippingInfo(rawProduct, platform) || undefined,
      productSpecs: extractProductSpecs(rawProduct, platform) || undefined,
      scrapedAt: new Date().toISOString(),
      confidence: 85, // Default confidence
      dataQuality: 'good' // Default quality
    };

    // Validate product data
    const validation = validateProductData(product);
    product.confidence = validation.confidence;
    product.dataQuality = validation.dataQuality;

    // Only return products that meet minimum quality standards
    if (validation.isValid && validation.confidence >= 60) {
      return product;
    } else {
      console.log(`⚠️ Product ${product.title} failed validation:`, validation.errors);
      return null;
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error processing single product:', errorMessage);
    return null;
  }
}

/**
 * Data extraction helpers
 */
function extractTitle(rawProduct: any, platform: string): string | null {
  const titleSelectors = [
    'title', 'name', 'productTitle', 'productName',
    'h1', 'h2', '.title', '.name', '[class*="title"]', '[class*="name"]'
  ];

  for (const selector of titleSelectors) {
    if (rawProduct[selector]) {
      return String(rawProduct[selector]).trim();
    }
  }

  return null;
}

function extractPrice(rawProduct: any, platform: string): string | null {
  const priceSelectors = [
    'price', 'cost', 'amount', 'productPrice',
    '.price', '.cost', '[class*="price"]', '[class*="cost"]'
  ];

  for (const selector of priceSelectors) {
    if (rawProduct[selector]) {
      return String(rawProduct[selector]).trim();
    }
  }

  return null;
}

function extractDescription(rawProduct: any, platform: string): string | null {
  const descSelectors = [
    'description', 'desc', 'detail', 'productDescription',
    '.description', '.desc', '[class*="description"]', '[class*="detail"]'
  ];

  for (const selector of descSelectors) {
    if (rawProduct[selector]) {
      return String(rawProduct[selector]).trim();
    }
  }

  return null;
}

function extractImages(rawProduct: any, platform: string): string[] {
  const imageSelectors = [
    'images', 'image', 'photos', 'picture',
    '.image', '.photo', '[class*="image"]', '[class*="photo"]'
  ];

  for (const selector of imageSelectors) {
    if (rawProduct[selector]) {
      const images = rawProduct[selector];
      if (Array.isArray(images)) {
        return images.filter(img => img && typeof img === 'string');
      } else if (typeof images === 'string') {
        return [images];
      }
    }
  }

  return [];
}

function extractUrl(rawProduct: any, platform: string): string | null {
  const urlSelectors = [
    'url', 'link', 'href', 'productUrl',
    '.url', '.link', '[class*="url"]', '[class*="link"]'
  ];

  for (const selector of urlSelectors) {
    if (rawProduct[selector]) {
      return String(rawProduct[selector]).trim();
    }
  }

  return null;
}

function extractSupplierName(rawProduct: any, platform: string): string | null {
  const supplierSelectors = [
    'supplier', 'vendor', 'seller', 'company',
    '.supplier', '.vendor', '[class*="supplier"]', '[class*="vendor"]'
  ];

  for (const selector of supplierSelectors) {
    if (rawProduct[selector]) {
      return String(rawProduct[selector]).trim();
    }
  }

  return null;
}

// Additional extraction helpers (simplified for brevity)
function extractOriginalPrice(rawProduct: any, platform: string): string | null { return null; }
function extractSupplierRating(rawProduct: any, platform: string): number | null { return null; }
function extractProductRating(rawProduct: any, platform: string): number | null { return null; }
function extractSoldCount(rawProduct: any, platform: string): number | null { return null; }
function extractMinOrderQuantity(rawProduct: any, platform: string): string | null { return null; }
function extractMaterial(rawProduct: any, platform: string): string | null { return null; }
function extractColor(rawProduct: any, platform: string): string | null { return null; }
function extractSize(rawProduct: any, platform: string): string | null { return null; }
function extractBrand(rawProduct: any, platform: string): string | null { return null; }
function extractWarranty(rawProduct: any, platform: string): string | null { return null; }
function extractShippingInfo(rawProduct: any, platform: string): any { return null; }
function extractProductSpecs(rawProduct: any, platform: string): Record<string, string> | null { return null; }

/**
 * Generate unique product ID
 */
function generateProductId(rawProduct: any, platform: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const title = extractTitle(rawProduct, platform) || 'unknown';
  const titleHash = title.substring(0, 10).replace(/\s+/g, '-').toLowerCase();
  
  return `${platform}_${titleHash}_${timestamp}_${random}`;
}

/**
 * Validate product data
 */
function validateProductData(product: DiscoveredProduct): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let confidence = 100;

  // Basic validation
  if (!product.title || product.title.length < 3) {
    errors.push('Title too short');
    confidence -= 20;
  }

  if (!product.price || parseFloat(product.price) <= 0) {
    errors.push('Invalid price');
    confidence -= 25;
  }

  if (!product.description || product.description.length < 10) {
    errors.push('Description too short');
    confidence -= 15;
  }

  if (!product.images || product.images.length === 0) {
    warnings.push('No images');
    confidence -= 10;
  }

  // Determine data quality
  let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  if (confidence >= 90) dataQuality = 'excellent';
  else if (confidence >= 75) dataQuality = 'good';
  else if (confidence >= 60) dataQuality = 'fair';
  else dataQuality = 'poor';

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    confidence: Math.max(0, confidence),
    dataQuality
  };
} 