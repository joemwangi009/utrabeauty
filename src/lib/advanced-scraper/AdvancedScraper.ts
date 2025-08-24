import puppeteer, { Browser, Page, BrowserContext } from 'puppeteer';
import { MobileEmulator } from './MobileEmulator';
import { ProxyManager } from './ProxyManager';
import { HumanBehaviorSimulator } from './HumanBehaviorSimulator';
import { SessionManager } from './SessionManager';
import { DataValidator } from './DataValidator';
import { IntelligentRetrySystem } from './IntelligentRetrySystem';
import { ScrapingQueue } from './ScrapingQueue';
import { RateLimiter } from './RateLimiter';
import { ScrapingJob, ScrapingResult, ValidationResult } from './types';

export class AdvancedScraper {
  private mobileEmulator: MobileEmulator;
  private proxyManager: ProxyManager;
  private humanBehaviorSimulator: HumanBehaviorSimulator;
  private sessionManager: SessionManager;
  private dataValidator: DataValidator;
  private intelligentRetrySystem: IntelligentRetrySystem;
  private scrapingQueue: ScrapingQueue;
  private rateLimiter: RateLimiter;

  private browser: Browser | null = null;
  private isInitialized = false;

  constructor() {
    this.mobileEmulator = new MobileEmulator();
    this.proxyManager = new ProxyManager();
    this.humanBehaviorSimulator = new HumanBehaviorSimulator();
    this.sessionManager = new SessionManager();
    this.dataValidator = new DataValidator();
    this.intelligentRetrySystem = new IntelligentRetrySystem();
    this.scrapingQueue = new ScrapingQueue();
    this.rateLimiter = new RateLimiter({
      maxRequests: 15,
      perMinute: 60,
      maxConcurrent: 3
    });
  }

  /**
   * Initialize the scraper
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔄 Scraper already initialized');
      return;
    }

    console.log('🚀 Initializing Advanced Scraper...');

    try {
      // Initialize browser with advanced anti-detection settings
      this.browser = await this.launchAdvancedBrowser();
      
      // Initialize components
      await this.proxyManager.refreshProxyList();
      
      this.isInitialized = true;
      console.log('✅ Advanced Scraper initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to initialize Advanced Scraper:', errorMessage);
      throw error;
    }
  }

  /**
   * Launch browser with advanced anti-detection settings
   */
  private async launchAdvancedBrowser(): Promise<Browser> {
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
      // Use Browserless.io for Vercel production
      const browserlessUrl = process.env.BROWSERLESS_URL || 'https://chrome.browserless.io';
      console.log(`🌐 Using production Browserless service: ${browserlessUrl}`);
      
      return await puppeteer.connect({
        browserWSEndpoint: `${browserlessUrl}?token=${process.env.BROWSERLESS_TOKEN || ''}`,
      });
    } else {
      // Use local Puppeteer with advanced anti-detection settings
      console.log('🌐 Using local Puppeteer with advanced anti-detection settings');
      
      return await puppeteer.launch({
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
          '--disable-ipc-flooding-protection',
          '--disable-blink-features=AutomationControlled',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps',
          '--disable-sync',
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
          '--disable-client-side-phishing-detection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-client-side-phishing-detection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-features=VizDisplayCompositor',
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
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-client-side-phishing-detection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }
  }

  /**
   * Create a new page with advanced anti-detection measures
   */
  async createAdvancedPage(strategy: 'stealth' | 'mobile' | 'api_interception' = 'stealth'): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const page = await this.browser.newPage();
    
    // Apply advanced anti-detection measures
    await this.applyAntiDetectionMeasures(page, strategy);
    
    return page;
  }

  /**
   * Apply comprehensive anti-detection measures
   */
  private async applyAntiDetectionMeasures(page: Page, strategy: string): Promise<void> {
    console.log(`🛡️ Applying anti-detection measures for strategy: ${strategy}`);

    // Set realistic headers
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
      'Referer': 'https://www.google.com/',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'DNT': '1',
      'Connection': 'keep-alive'
    });

    // Inject stealth JavaScript
    await page.evaluateOnNewDocument(() => {
      // Override webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as PermissionStatus) :
          originalQuery(parameters)
      );

      // Override chrome runtime
      (window as any).chrome = {
        runtime: {},
      };

      // Override permissions API
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = function(constraints) {
        return originalGetUserMedia.call(this, constraints);
      };
    });

    // Apply strategy-specific measures
    switch (strategy) {
      case 'mobile':
        await this.mobileEmulator.emulateMobileDevice(page);
        await this.mobileEmulator.simulateMobileBehaviors(page);
        break;
      
      case 'stealth':
        // Set desktop viewport
        await page.setViewport({ width: 1920, height: 1080 });
        break;
      
      case 'api_interception':
        // Set up API request interception
        await this.setupAPIInterception(page);
        break;
    }

    console.log(`✅ Anti-detection measures applied for ${strategy} strategy`);
  }

  /**
   * Set up API request interception
   */
  private async setupAPIInterception(page: Page): Promise<void> {
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
        console.log(`🔍 Intercepted API call: ${request.url()}`);
      }
      request.continue();
    });

    page.on('response', async (response) => {
      if (response.url().includes('/api/') && response.status() === 200) {
        try {
          const data = await response.json();
          console.log(`📡 API response captured: ${response.url()}`);
        } catch (e) {
          // Handle non-JSON responses
        }
      }
    });
  }

  /**
   * Scrape products using multiple strategies
   */
  async scrapeProducts(
    url: string,
    platform: 'alibaba' | 'aliexpress' | 'amazon',
    options: {
      strategy?: 'stealth' | 'mobile' | 'api_interception';
      useProxy?: boolean;
      simulateHuman?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    console.log(`🚀 Starting product scraping: ${url}`);
    console.log(`📱 Platform: ${platform}`);
    console.log(`🎯 Strategy: ${options.strategy || 'stealth'}`);

    try {
      // Wait for rate limiter
      await this.rateLimiter.waitForSlot();

      // Get proxy if requested
      let proxy: any = null;
      if (options.useProxy) {
        proxy = await this.proxyManager.getNextProxy();
        if (proxy) {
          console.log(`🌐 Using proxy: ${proxy.host}:${proxy.port}`);
        }
      }

      // Create session
      const sessionId = await this.sessionManager.createSession();
      
      // Try multiple strategies
      const strategies = options.strategy ? [options.strategy] : ['stealth', 'mobile', 'api_interception'];
      
      for (const strategy of strategies) {
        try {
          console.log(`🔄 Trying strategy: ${strategy}`);
          
          const result = await this.executeScrapingStrategy(
            url,
            platform,
            strategy,
            sessionId,
            proxy,
            options.simulateHuman !== false
          );

          if (result.success) {
            const executionTime = Date.now() - startTime;
            console.log(`✅ Scraping successful with ${strategy} strategy in ${executionTime}ms`);
            
            return {
              ...result,
              executionTime,
              strategy,
              sessionId,
              proxyUsed: proxy ? `${proxy.host}:${proxy.port}` : undefined
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`❌ Strategy ${strategy} failed:`, errorMessage);
          continue;
        }
      }

      throw new Error('All scraping strategies failed');

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Scraping failed after ${executionTime}ms:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        confidence: 0,
        executionTime,
        strategy: 'failed',
        sessionId: 'unknown'
      };
    }
  }

  /**
   * Execute a specific scraping strategy
   */
  private async executeScrapingStrategy(
    url: string,
    platform: string,
    strategy: string,
    sessionId: string,
    proxy: any,
    simulateHuman: boolean
  ): Promise<ScrapingResult> {
    const page = await this.createAdvancedPage(strategy as any);
    
    try {
      // Navigate to URL
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 45000 
      });

      // Simulate human behavior if requested
      if (simulateHuman) {
        await this.humanBehaviorSimulator.simulateHumanBehavior(page);
      }

      // Extract data based on platform
      const data = await this.extractProductData(page, platform);
      
      // Validate extracted data
      const validation = this.dataValidator.validateProductData(data);
      
      if (!validation.isValid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }

      return {
        success: true,
        data,
        confidence: validation.confidence,
        executionTime: 0, // Will be set by caller
        strategy,
        sessionId
      };

    } finally {
      await page.close();
    }
  }

  /**
   * Extract product data from the page
   */
  private async extractProductData(page: Page, platform: string): Promise<any> {
    console.log(`📊 Extracting product data from ${platform}`);

    const data = await page.evaluate((platform) => {
      // Platform-specific data extraction logic
      if (platform === 'alibaba') {
        return {
          title: document.querySelector('.product-title')?.textContent?.trim() ||
                 document.querySelector('h1')?.textContent?.trim() ||
                 'Unknown Product',
          
          price: document.querySelector('.price')?.textContent?.trim() ||
                 document.querySelector('[class*="price"]')?.textContent?.trim() ||
                 '0',
          
          description: document.querySelector('.product-description')?.textContent?.trim() ||
                      document.querySelector('[class*="description"]')?.textContent?.trim() ||
                      'No description available',
          
          images: Array.from(document.querySelectorAll('img[src*="product"]'))
            .map(img => (img as HTMLImageElement).src)
            .filter(src => src && !src.includes('data:')),
          
          supplierName: document.querySelector('.supplier-name')?.textContent?.trim() ||
                        document.querySelector('[class*="supplier"]')?.textContent?.trim() ||
                        'Unknown Supplier',
          
          url: window.location.href,
          scrapedAt: new Date().toISOString()
        };
      } else if (platform === 'aliexpress') {
        // AliExpress specific extraction
        return {
          title: document.querySelector('.product-title')?.textContent?.trim() ||
                 document.querySelector('h1')?.textContent?.trim() ||
                 'Unknown Product',
          
          price: document.querySelector('.price')?.textContent?.trim() ||
                 document.querySelector('[class*="price"]')?.textContent?.trim() ||
                 '0',
          
          description: document.querySelector('.product-description')?.textContent?.trim() ||
                      document.querySelector('[class*="description"]')?.textContent?.trim() ||
                      'No description available',
          
          images: Array.from(document.querySelectorAll('img[src*="product"]'))
            .map(img => (img as HTMLImageElement).src)
            .filter(src => src && !src.includes('data:')),
          
          supplierName: document.querySelector('.supplier-name')?.textContent?.trim() ||
                        document.querySelector('[class*="supplier"]')?.textContent?.trim() ||
                        'Unknown Supplier',
          
          url: window.location.href,
          scrapedAt: new Date().toISOString()
        };
      } else {
        // Amazon specific extraction
        return {
          title: document.querySelector('#productTitle')?.textContent?.trim() ||
                 document.querySelector('h1')?.textContent?.trim() ||
                 'Unknown Product',
          
          price: document.querySelector('.a-price-whole')?.textContent?.trim() ||
                 document.querySelector('[class*="price"]')?.textContent?.trim() ||
                 '0',
          
          description: document.querySelector('#productDescription')?.textContent?.trim() ||
                      document.querySelector('[class*="description"]')?.textContent?.trim() ||
                      'No description available',
          
          images: Array.from(document.querySelectorAll('img[data-old-hires]'))
            .map(img => (img as HTMLImageElement).getAttribute('data-old-hires'))
            .filter(src => src && !src.includes('data:')) ||
            Array.from(document.querySelectorAll('img[src*="images"]'))
              .map(img => (img as HTMLImageElement).src)
              .filter(src => src && !src.includes('data:')),
          
          supplierName: 'Amazon',
          url: window.location.href,
          scrapedAt: new Date().toISOString()
        };
      }
    }, platform);

    console.log(`✅ Extracted data: ${data.title}`);
    return data;
  }

  /**
   * Close the scraper and cleanup resources
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    this.isInitialized = false;
    console.log('🔒 Advanced Scraper closed');
  }

  /**
   * Get scraper statistics
   */
  getStats(): {
    isInitialized: boolean;
    proxyStats: any;
    sessionCount: number;
    queueLength: number;
  } {
    return {
      isInitialized: this.isInitialized,
      proxyStats: this.proxyManager.getProxyStats(),
      sessionCount: this.sessionManager.getActiveSessionCount(),
      queueLength: this.scrapingQueue.getQueueLength()
    };
  }
} 