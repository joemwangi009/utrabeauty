import { Page } from 'puppeteer';
import { MobileDevice } from './types';

export class MobileEmulator {
  private mobileDevices: MobileDevice[] = [
    // iPhone devices
    {
      name: 'iPhone 14 Pro',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      viewport: {
        width: 393,
        height: 852,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        isLandscape: false
      },
      capabilities: {
        hasTouch: true,
        hasMouse: false,
        hasKeyboard: false,
        isMobile: true
      }
    },
    {
      name: 'iPhone 13',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Safari/604.1',
      viewport: {
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        isLandscape: false
      },
      capabilities: {
        hasTouch: true,
        hasMouse: false,
        hasKeyboard: false,
        isMobile: true
      }
    },
    // Android devices
    {
      name: 'Samsung Galaxy S23',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
      viewport: {
        width: 412,
        height: 915,
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
        isLandscape: false
      },
      capabilities: {
        hasTouch: true,
        hasMouse: false,
        hasKeyboard: false,
        isMobile: true
      }
    },
    {
      name: 'Google Pixel 7',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
      viewport: {
        width: 412,
        height: 915,
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
        isLandscape: false
      },
      capabilities: {
        hasTouch: true,
        hasMouse: false,
        hasKeyboard: false,
        isMobile: true
      }
    },
    // Tablet devices
    {
      name: 'iPad Pro 12.9',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      viewport: {
        width: 1024,
        height: 1366,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        isLandscape: false
      },
      capabilities: {
        hasTouch: true,
        hasMouse: false,
        hasKeyboard: false,
        isMobile: true
      }
    }
  ];

  /**
   * Get a random mobile device configuration
   */
  getRandomDevice(): MobileDevice {
    const randomIndex = Math.floor(Math.random() * this.mobileDevices.length);
    return this.mobileDevices[randomIndex];
  }

  /**
   * Get a specific device by name
   */
  getDeviceByName(name: string): MobileDevice | undefined {
    return this.mobileDevices.find(device => device.name === name);
  }

  /**
   * Emulate a mobile device on the page
   */
  async emulateMobileDevice(page: Page, device?: MobileDevice): Promise<void> {
    const targetDevice = device || this.getRandomDevice();
    
    console.log(`📱 Emulating mobile device: ${targetDevice.name}`);

    // Set viewport
    await page.setViewport(targetDevice.viewport);

    // Set user agent
    await page.setUserAgent(targetDevice.userAgent);

    // Set mobile-specific headers
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
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'DNT': '1',
      'Connection': 'keep-alive'
    });

    // Inject mobile-specific JavaScript
    await page.evaluateOnNewDocument(() => {
      // Override navigator properties
      Object.defineProperty(navigator, 'maxTouchPoints', {
        get: () => 5
      });

      Object.defineProperty(navigator, 'platform', {
        get: () => 'iPhone'
      });

      Object.defineProperty(navigator, 'vendor', {
        get: () => 'Apple Computer, Inc.'
      });

      // Override screen properties
      Object.defineProperty(screen, 'width', {
        get: () => 393
      });

      Object.defineProperty(screen, 'height', {
        get: () => 852
      });

      // Override window properties
      Object.defineProperty(window, 'innerWidth', {
        get: () => 393
      });

      Object.defineProperty(window, 'innerHeight', {
        get: () => 852
      });

      // Override device pixel ratio
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => 3
      });

      // Override touch events
      window.ontouchstart = null;
      window.ontouchmove = null;
      window.ontouchend = null;

      // Override orientation
      Object.defineProperty(screen, 'orientation', {
        get: () => ({
          type: 'portrait-primary',
          angle: 0
        })
      });
    });

    // Set mobile-specific permissions
    const context = page.context();
    if (context) {
      await context.overridePermissions('https://www.alibaba.com', [
        'geolocation',
        'notifications',
        'camera',
        'microphone'
      ]);
    }

    console.log(`✅ Mobile device emulation completed for ${targetDevice.name}`);
  }

  /**
   * Simulate mobile-specific behaviors
   */
  async simulateMobileBehaviors(page: Page): Promise<void> {
    console.log('📱 Simulating mobile-specific behaviors...');

    // Simulate touch gestures
    await this.simulateTouchGestures(page);

    // Simulate mobile scrolling
    await this.simulateMobileScrolling(page);

    // Simulate mobile navigation
    await this.simulateMobileNavigation(page);

    console.log('✅ Mobile behaviors simulation completed');
  }

  /**
   * Simulate touch gestures
   */
  private async simulateTouchGestures(page: Page): Promise<void> {
    // Simulate pinch to zoom
    await page.evaluate(() => {
      const touchEvent = new TouchEvent('touchstart', {
        touches: [
          new Touch({
            identifier: 0,
            target: document.body,
            clientX: 100,
            clientY: 100,
            pageX: 100,
            pageY: 100,
            radiusX: 10,
            radiusY: 10,
            rotationAngle: 0,
            force: 1
          }),
          new Touch({
            identifier: 1,
            target: document.body,
            clientX: 200,
            clientY: 200,
            pageX: 200,
            pageY: 200,
            radiusX: 10,
            radiusY: 10,
            rotationAngle: 0,
            force: 1
          })
        ]
      });
      document.body.dispatchEvent(touchEvent);
    });

    await this.randomDelay(500, 1500);
  }

  /**
   * Simulate mobile scrolling
   */
  private async simulateMobileScrolling(page: Page): Promise<void> {
    const scrollSteps = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < scrollSteps; i++) {
      const scrollAmount = Math.floor(Math.random() * 200) + 100;
      
      await page.evaluate((amount) => {
        window.scrollBy({
          top: amount,
          behavior: 'smooth'
        });
      }, scrollAmount);

      await this.randomDelay(800, 2000);
    }
  }

  /**
   * Simulate mobile navigation
   */
  private async simulateMobileNavigation(page: Page): Promise<void> {
    // Simulate back button press
    await page.evaluate(() => {
      window.history.back();
    });

    await this.randomDelay(1000, 2000);

    // Simulate forward button press
    await page.evaluate(() => {
      window.history.forward();
    });

    await this.randomDelay(1000, 2000);
  }

  /**
   * Random delay utility
   */
  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Get all available devices
   */
  getAllDevices(): MobileDevice[] {
    return [...this.mobileDevices];
  }

  /**
   * Add a custom mobile device
   */
  addCustomDevice(device: MobileDevice): void {
    this.mobileDevices.push(device);
    console.log(`📱 Added custom mobile device: ${device.name}`);
  }

  /**
   * Remove a device by name
   */
  removeDevice(name: string): boolean {
    const initialLength = this.mobileDevices.length;
    this.mobileDevices = this.mobileDevices.filter(device => device.name !== name);
    const removed = initialLength !== this.mobileDevices.length;
    
    if (removed) {
      console.log(`🗑️ Removed mobile device: ${name}`);
    }
    
    return removed;
  }
} 