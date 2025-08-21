import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { completeAlibabaImport, ScrapedProduct } from '@/lib/alibaba-importer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, importToSanity = false, categoryId } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required in request body' },
        { status: 400 }
      );
    }

    // Validate that it's an Alibaba URL
    if (!url.includes('alibaba.com') && !url.includes('aliexpress.com')) {
      return NextResponse.json(
        { error: 'Only Alibaba and AliExpress URLs are supported' },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting scrape and import for: ${url}`);

    // Launch browser
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
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the product page
    console.log('🌐 Navigating to product page...');
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for the page to load completely
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract product data
    console.log('📊 Extracting product data...');
    
    const productData: ScrapedProduct = await page.evaluate(() => {
      // Helper function to safely extract text content
      const safeText = (selector: string): string => {
        const element = document.querySelector(selector);
        return element ? element.textContent?.trim() || '' : '';
      };

      // Helper function to extract multiple images
      const extractImages = (): string[] => {
        const images: string[] = [];
        
        // Try different selectors for images
        const selectors = [
          '.product-image img',
          '.gallery-image img',
          '.main-image img',
          '.product-gallery img',
          'img[data-src]',
          'img[src*="product"]'
        ];

        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el: Element) => {
            const img = el as HTMLImageElement;
            if (img.src && img.src.startsWith('http')) {
              images.push(img.src);
            }
            if (img.dataset.src && img.dataset.src.startsWith('http')) {
              images.push(img.dataset.src);
            }
          });
        });

        // Remove duplicates and return unique images
        return [...new Set(images)].slice(0, 10); // Limit to 10 images
      };

      // Extract title
      let title = '';
      const titleSelectors = [
        'h1.product-title',
        'h1.title',
        '.product-name h1',
        '.product-title h1',
        'h1[data-testid="product-title"]',
        'h1'
      ];

      for (const selector of titleSelectors) {
        title = safeText(selector);
        if (title) break;
      }

      // Extract description
      let description = '';
      const descSelectors = [
        '.product-description',
        '.description',
        '.product-details',
        '.product-info',
        '[data-testid="product-description"]'
      ];

      for (const selector of descSelectors) {
        description = safeText(selector);
        if (description) break;
      }

      // Extract price
      let price = '';
      const priceSelectors = [
        '.product-price',
        '.price',
        '.current-price',
        '.main-price',
        '[data-testid="price"]',
        '.price-value'
      ];

      for (const selector of priceSelectors) {
        price = safeText(selector);
        if (price) break;
      }

      // Clean up price (remove currency symbols, extra spaces)
      if (price) {
        price = price.replace(/[^\d.,]/g, '').trim();
      }

      // Extract images
      const images = extractImages();

      return {
        title,
        description,
        price,
        images,
        scrapedAt: new Date().toISOString()
      };
    });

    await browser.close();

    // Validate extracted data
    if (!productData.title) {
      console.warn('⚠️ No title found');
    }
    if (!productData.description) {
      console.warn('⚠️ No description found');
    }
    if (!productData.price) {
      console.warn('⚠️ No price found');
    }
    if (productData.images.length === 0) {
      console.warn('⚠️ No images found');
    }

    console.log('✅ Scraping completed successfully');
    console.log(`📦 Product: ${productData.title}`);
    console.log(`💰 Price: ${productData.price}`);
    console.log(`🖼️ Images: ${productData.images.length} found`);

    let importResult = null;

    // Import to Sanity if requested
    if (importToSanity) {
      try {
        console.log('📥 Importing to Sanity CMS...');
        importResult = await completeAlibabaImport(productData, url, categoryId);
        console.log('✅ Import to Sanity completed successfully');
      } catch (importError) {
        console.error('❌ Import to Sanity failed:', importError);
        return NextResponse.json({
          success: false,
          error: 'Scraping successful but import failed',
          details: importError instanceof Error ? importError.message : 'Unknown import error',
          scrapedData: productData,
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      data: productData,
      importResult,
      message: importToSanity 
        ? 'Product scraped and imported successfully' 
        : 'Product scraped successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Scraping error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to scrape product',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Also support GET requests for backward compatibility
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const importToSanity = searchParams.get('import') === 'true';
  const categoryId = searchParams.get('categoryId');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  // Convert to POST request body
  const body = {
    url,
    importToSanity,
    categoryId: categoryId || undefined
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