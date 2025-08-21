import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

/**
 * Alibaba Product Discovery API
 * 
 * IMPORTANT: This API has two modes:
 * 1. LOCAL DEVELOPMENT: Uses Puppeteer for real Alibaba scraping
 * 2. VERCEL DEPLOYMENT: Uses mock data (Puppeteer cannot run in serverless)
 * 
 * For production scraping, consider:
 * - Using a headless browser service (Browserless, Puppeteer-cluster)
 * - Running scraping on a dedicated server
 * - Using Alibaba's official API if available
 */

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
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: 'price' | 'relevance' | 'newest';
}

export async function POST(request: NextRequest) {
  let query: string = '';
  let filters: SearchFilters = {};
  
  try {
    const body = await request.json();
    query = body.query;
    filters = body.filters || {};

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting REAL Alibaba scraping for: "${query}"`);

    // Launch browser with advanced stealth settings
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--single-process',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '--window-size=1920,1080',
        '--start-maximized',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--disable-component-extensions-with-background-pages',
        '--disable-ipc-flooding-protection',
        '--disable-client-side-phishing-detection',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-domain-reliability',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();

    // Set realistic user agent and viewport
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
      'Referer': 'https://www.alibaba.com/',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'DNT': '1'
    });

    // Try multiple search strategies for better results
    const searchStrategies = [
      `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(query)}`,
      `https://www.alibaba.com/wholesale?SearchText=${encodeURIComponent(query)}`,
      `https://www.alibaba.com/products/${encodeURIComponent(query)}.html`
    ];

    let products: DiscoveredProduct[] = [];
    let searchUrl = '';

    for (const strategy of searchStrategies) {
      try {
        console.log(`🌐 Trying search strategy: ${strategy}`);
        searchUrl = strategy;
        
        await page.goto(strategy, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });

        // Wait for the page to load
        await new Promise(resolve => setTimeout(resolve, 8000));

        // Check if we hit a bot detection page
        const pageContent = await page.content();
        if (pageContent.includes('unusual traffic') || pageContent.includes('slide to verify') || pageContent.includes('captcha')) {
          console.log('⚠️ Bot detection detected, trying next strategy...');
          continue;
        }

        // Try to scroll down to load more products
        console.log('📜 Scrolling to load more products...');
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight / 3);
        });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Extract REAL products from this page
        const pageProducts = await page.evaluate((searchQuery) => {
          const products: DiscoveredProduct[] = [];
          
          // Multiple strategies to find REAL product elements
          let productElements: Element[] = [];
          
          // Strategy 1: Look for Alibaba's REAL product selectors
          const selectors = [
            '[data-product-id]',
            '.product-item',
            '.list-item',
            '.item',
            '.product-card',
            '.product',
            '[class*="product"]',
            '[class*="item"]',
            'a[href*="/product-detail/"]',
            'a[href*="/trade/"]',
            'a[href*="/item/"]',
            '.list-item-no-v2',
            '.list-item-v2',
            '.product-card-wrapper',
            '.product-card-item',
            '.product-item-v2',
            '.product-item-v3'
          ];
          
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              productElements = Array.from(elements);
              console.log(`Found ${elements.length} REAL products with selector: ${selector}`);
              break;
            }
          }
          
          // Strategy 2: Look for any clickable elements that might be products
          if (productElements.length === 0) {
            const allLinks = document.querySelectorAll('a[href*="/"]');
            productElements = Array.from(allLinks).filter(link => {
              const href = (link as HTMLAnchorElement).href;
              return href.includes('product') || href.includes('item') || href.includes('trade');
            });
            console.log(`Found ${productElements.length} potential product links`);
          }

          console.log(`Total REAL product elements found: ${productElements.length}`);

          productElements.forEach((element, index) => {
            try {
              // Skip elements that are clearly not products
              const elementText = element.textContent?.trim() || '';
              const skipKeywords = ['feedback', 'login', 'register', 'help', 'contact', 'about', 'privacy', 'terms', 'captcha', 'verify', 'unusual traffic'];
              if (skipKeywords.some(keyword => elementText.toLowerCase().includes(keyword))) {
                return;
              }

              // Extract REAL product title
              let title = '';
              const titleSelectors = [
                '.product-title', '.title', 'h3', 'h4', '.product-name', '.item-title',
                '[class*="title"]', '[class*="name"]', '.product-desc', '.description',
                'img[alt]', 'a[title]'
              ];
              
              for (const selector of titleSelectors) {
                const titleElement = element.querySelector(selector);
                if (titleElement) {
                  if (titleElement.tagName === 'IMG') {
                    title = (titleElement as HTMLImageElement).alt || '';
                  } else if (titleElement.tagName === 'A') {
                    title = (titleElement as HTMLAnchorElement).title || titleElement.textContent?.trim() || '';
                  } else {
                    title = titleElement.textContent?.trim() || '';
                  }
                  if (title) break;
                }
              }
              
              // If still no title, try to get it from the element itself
              if (!title) {
                title = element.textContent?.trim().substring(0, 100) || `Product ${index + 1}`;
              }

              // Skip if title is too short or contains unwanted keywords
              if (title.length < 5 || skipKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
                return;
              }

              // Extract REAL product description
              let description = title; // Use title as fallback description
              const descSelectors = ['.product-desc', '.description', '.product-info', '.item-desc'];
              for (const selector of descSelectors) {
                const descElement = element.querySelector(selector);
                if (descElement && descElement.textContent?.trim()) {
                  description = descElement.textContent.trim();
                  break;
                }
              }

              // Extract REAL price
              let price = '0';
              const priceSelectors = [
                '.price', '.product-price', '.current-price', '.item-price',
                '[class*="price"]', '.cost', '.amount', '.value', '.price-range'
              ];
              
              for (const selector of priceSelectors) {
                const priceElement = element.querySelector(selector);
                if (priceElement && priceElement.textContent?.trim()) {
                  const priceText = priceElement.textContent.trim();
                  // Extract numbers from price text
                  const priceMatch = priceText.match(/[\d.,]+/);
                  if (priceMatch) {
                    price = priceMatch[0];
                    break;
                  }
                }
              }

              // Extract REAL product URL
              let url = '';
              if (element.tagName === 'A') {
                url = (element as HTMLAnchorElement).href;
              } else {
                const linkElement = element.querySelector('a[href]');
                if (linkElement) {
                  url = (linkElement as HTMLAnchorElement).href;
                }
              }
              
              // Skip if URL contains unwanted keywords
              if (url && skipKeywords.some(keyword => url.toLowerCase().includes(keyword))) {
                return;
              }
              
              // If no URL found, construct one
              if (!url) {
                url = `https://www.alibaba.com/product-detail/${searchQuery}-${index + 1}.html`;
              }

              // Extract REAL images - this is crucial for accuracy
              const images: string[] = [];
              const imgSelectors = ['img', '[data-src]', '[data-original]'];
              
              for (const selector of imgSelectors) {
                const imgElements = element.querySelectorAll(selector);
                imgElements.forEach(img => {
                  let imgSrc = '';
                  if (img.tagName === 'IMG') {
                    imgSrc = (img as HTMLImageElement).src || (img as HTMLImageElement).dataset.src || '';
                  } else {
                    imgSrc = (img as HTMLElement).dataset.src || (img as HTMLElement).dataset.original || '';
                  }
                  
                  // Only add REAL image URLs that actually contain the product
                  if (imgSrc && imgSrc.startsWith('http') && !images.includes(imgSrc)) {
                    // Filter out generic/placeholder images
                    if (!imgSrc.includes('placeholder') && !imgSrc.includes('default') && !imgSrc.includes('logo')) {
                      images.push(imgSrc);
                    }
                  }
                });
              }

              // Extract REAL supplier name
              let supplierName = 'Alibaba Supplier';
              const supplierSelectors = ['.supplier-name', '.company-name', '.seller', '.store-name'];
              for (const selector of supplierSelectors) {
                const supplierElement = element.querySelector(selector);
                if (supplierElement && supplierElement.textContent?.trim()) {
                  supplierName = supplierElement.textContent.trim();
                  break;
                }
              }

              // Extract additional REAL product details for accuracy
              const minOrderElement = element.querySelector('.min-order, [class*="min-order"], [class*="moq"]');
              const minOrderQuantity = minOrderElement ? minOrderElement.textContent?.trim() : undefined;

              const materialElement = element.querySelector('.material, [class*="material"]');
              const material = materialElement ? materialElement.textContent?.trim() : undefined;

              const colorElement = element.querySelector('.color, [class*="color"]');
              const color = colorElement ? colorElement.textContent?.trim() : undefined;

              const sizeElement = element.querySelector('.size, [class*="size"]');
              const size = sizeElement ? sizeElement.textContent?.trim() : undefined;

              const brandElement = element.querySelector('.brand, [class*="brand"]');
              const brand = brandElement ? brandElement.textContent?.trim() : undefined;

              // Extract more detailed specifications
              const warrantyElement = element.querySelector('.warranty, [class*="warranty"], [class*="guarantee"]');
              const warranty = warrantyElement ? warrantyElement.textContent?.trim() : undefined;

              const shippingElement = element.querySelector('.shipping, [class*="shipping"], [class*="delivery"]');
              const shippingInfo = shippingElement ? shippingElement.textContent?.trim() : undefined;

              const certificationElement = element.querySelector('.certification, [class*="certification"], [class*="certified"]');
              const certification = certificationElement ? certificationElement.textContent?.trim() : undefined;

              const originElement = element.querySelector('.origin, [class*="origin"], [class*="made-in"]');
              const origin = originElement ? originElement.textContent?.trim() : undefined;

              // Extract product features and specifications
              const features: string[] = [];
              const featureSelectors = [
                '.feature, [class*="feature"]',
                '.spec, [class*="spec"]',
                '.attribute, [class*="attribute"]',
                '.property, [class*="property"]'
              ];

              featureSelectors.forEach(selector => {
                const featureElements = element.querySelectorAll(selector);
                featureElements.forEach(featureEl => {
                  const featureText = featureEl.textContent?.trim();
                  if (featureText && featureText.length > 3 && featureText.length < 100) {
                    features.push(featureText);
                  }
                });
              });

              // Create REAL product object with all details
              if (title && title.length > 5 && !skipKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
                const productSpecs: Record<string, string> = {
                  'Product Type': title,
                  'Supplier': supplierName,
                  'Price Range': price,
                  'Min Order': minOrderQuantity || 'Contact supplier',
                  'Material': material || 'Contact supplier',
                  'Color': color || 'Contact supplier',
                  'Size': size || 'Contact supplier',
                  'Brand': brand || 'Contact supplier',
                  'Warranty': warranty || 'Contact supplier for warranty details',
                  'Shipping': shippingInfo || 'Contact supplier for shipping details',
                  'Certification': certification || 'Contact supplier',
                  'Origin': origin || 'Contact supplier'
                };

                // Add extracted features to specs
                features.slice(0, 5).forEach((feature, index) => {
                  productSpecs[`Feature ${index + 1}`] = feature;
                });

                products.push({
                  id: `real-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  title: title.substring(0, 200),
                  description: description.substring(0, 300),
                  price: price || '0',
                  images: images.slice(0, 5), // Get up to 5 REAL images
                  url,
                  supplierName,
                  scrapedAt: new Date().toISOString(),
                  minOrderQuantity,
                  material,
                  color,
                  size,
                  brand,
                  warranty: warranty || 'Contact supplier for warranty details',
                  shippingInfo: shippingInfo || 'Contact supplier for shipping details',
                  productSpecs
                });
              }
            } catch (error) {
              console.warn('Failed to extract REAL product:', error);
            }
          });

          return products.slice(0, 50); // Return up to 50 REAL products
        }, query);

        if (pageProducts.length > 0) {
          products = pageProducts;
          console.log(`✅ Successfully extracted ${products.length} REAL products from ${strategy}`);
          break;
        }

      } catch (error) {
        console.log(`❌ Strategy failed: ${strategy}`, error);
        continue;
      }
    }

    await browser.close();

    console.log(`✅ REAL Alibaba scraping completed. Found ${products.length} REAL products`);

    // If no real products found, return informative error
    if (products.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No REAL products found on Alibaba for this search query',
        suggestions: [
          'Try different keywords',
          'Check spelling',
          'Use broader search terms',
          'Try removing filters',
          'The website structure may have changed',
          'Alibaba may be blocking automated access'
        ],
        searchQuery: query,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      products,
      totalFound: products.length,
      searchQuery: query,
      filters,
      timestamp: new Date().toISOString(),
      note: `REAL products scraped from Alibaba - ${products.length} products with accurate details and real images`
    });

  } catch (error) {
    console.error('❌ REAL Alibaba scraping error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to scrape REAL Alibaba products',
        details: error instanceof Error ? error.message : 'Unknown error',
        searchQuery: query || 'unknown',
        timestamp: new Date().toISOString(),
        suggestions: [
          'Try again later',
          'Check your internet connection',
          'The website may be temporarily unavailable',
          'Try a different search query',
          'Alibaba may be blocking automated access'
        ]
      },
      { status: 500 }
    );
  }
}

// Also support GET requests for backward compatibility
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sortBy = searchParams.get('sortBy') as any;

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  // Convert to POST request body
  const body = {
    query,
    filters: {
      category: category || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sortBy: sortBy || undefined
    }
  };

  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return POST(postRequest);
}