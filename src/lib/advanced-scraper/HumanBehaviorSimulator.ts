import { Page } from 'puppeteer';
import { HumanBehaviorConfig } from './types';

export class HumanBehaviorSimulator {
  private config: HumanBehaviorConfig;

  constructor(config?: Partial<HumanBehaviorConfig>) {
    this.config = {
      mouseMovement: {
        enabled: true,
        minDelay: 50,
        maxDelay: 200,
        naturalCurves: true
      },
      scrolling: {
        enabled: true,
        minScroll: 100,
        maxScroll: 300,
        scrollDelay: 1000
      },
      typing: {
        enabled: true,
        minDelay: 50,
        maxDelay: 150,
        naturalErrors: true
      },
      delays: {
        pageLoad: 2000,
        actionDelay: 500,
        requestDelay: 1000
      },
      ...config
    };
  }

  /**
   * Simulate human-like behavior on a page
   */
  async simulateHumanBehavior(page: Page): Promise<void> {
    console.log('🧑 Simulating human behavior...');

    try {
      // Wait for page to load
      await this.randomDelay(this.config.delays.pageLoad, this.config.delays.pageLoad + 1000);

      // Simulate mouse movements
      if (this.config.mouseMovement.enabled) {
        await this.simulateMouseMovement(page);
      }

      // Simulate natural scrolling
      if (this.config.scrolling.enabled) {
        await this.simulateNaturalScrolling(page);
      }

      // Simulate page interaction
      await this.simulatePageInteraction(page);

      console.log('✅ Human behavior simulation completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error during human behavior simulation:', errorMessage);
    }
  }

  /**
   * Simulate realistic mouse movements
   */
  async simulateMouseMovement(page: Page): Promise<void> {
    console.log('🖱️ Simulating mouse movements...');

    const viewport = await page.viewport();
    if (!viewport) return;

    const { width, height } = viewport;
    const points = this.generateNaturalMousePath(width, height);

    for (const point of points) {
      await page.mouse.move(point.x, point.y);
      await this.randomDelay(
        this.config.mouseMovement.minDelay,
        this.config.mouseMovement.maxDelay
      );
    }
  }

  /**
   * Generate natural mouse movement path
   */
  private generateNaturalMousePath(width: number, height: number): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    const numPoints = Math.floor(Math.random() * 8) + 5; // 5-12 points

    // Start from a random position
    let currentX = Math.random() * width;
    let currentY = Math.random() * height;

    for (let i = 0; i < numPoints; i++) {
      // Generate next point with natural curve
      const targetX = Math.random() * width;
      const targetY = Math.random() * height;

      if (this.config.mouseMovement.naturalCurves) {
        // Create intermediate points for natural curves
        const midPoints = this.generateCurvePoints(currentX, currentY, targetX, targetY);
        points.push(...midPoints);
      } else {
        points.push({ x: targetX, y: targetY });
      }

      currentX = targetX;
      currentY = targetY;
    }

    return points;
  }

  /**
   * Generate curve points for natural mouse movement
   */
  private generateCurvePoints(startX: number, startY: number, endX: number, endY: number): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    const numMidPoints = Math.floor(Math.random() * 3) + 2; // 2-4 intermediate points

    for (let i = 1; i <= numMidPoints; i++) {
      const t = i / (numMidPoints + 1);
      
      // Add some randomness to create natural curves
      const randomOffsetX = (Math.random() - 0.5) * 50;
      const randomOffsetY = (Math.random() - 0.5) * 50;

      const x = startX + (endX - startX) * t + randomOffsetX;
      const y = startY + (endY - startY) * t + randomOffsetY;

      points.push({ x, y });
    }

    return points;
  }

  /**
   * Simulate natural scrolling behavior
   */
  async simulateNaturalScrolling(page: Page): Promise<void> {
    console.log('📜 Simulating natural scrolling...');

    const scrollSteps = Math.floor(Math.random() * 4) + 2; // 2-5 scroll steps

    for (let i = 0; i < scrollSteps; i++) {
      const scrollAmount = Math.floor(Math.random() * 
        (this.config.scrolling.maxScroll - this.config.scrolling.minScroll)) + 
        this.config.scrolling.minScroll;

      // Random scroll direction (mostly down, sometimes up)
      const direction = Math.random() > 0.8 ? -1 : 1;
      const finalScrollAmount = scrollAmount * direction;

      await page.evaluate((amount) => {
        window.scrollBy({
          top: amount,
          behavior: 'smooth'
        });
      }, finalScrollAmount);

      // Wait between scrolls
      await this.randomDelay(
        this.config.scrolling.scrollDelay,
        this.config.scrolling.scrollDelay + 1000
      );

      // Sometimes pause longer (like reading content)
      if (Math.random() > 0.7) {
        await this.randomDelay(2000, 5000);
      }
    }
  }

  /**
   * Simulate page interaction
   */
  async simulatePageInteraction(page: Page): Promise<void> {
    console.log('👆 Simulating page interactions...');

    try {
      // Look for interactive elements
      const interactiveElements = await page.$$('button, a, input, select, textarea');

      if (interactiveElements.length > 0) {
        // Randomly interact with some elements
        const numInteractions = Math.min(
          Math.floor(Math.random() * 3) + 1,
          interactiveElements.length
        );

        for (let i = 0; i < numInteractions; i++) {
          const randomIndex = Math.floor(Math.random() * interactiveElements.length);
          const element = interactiveElements[randomIndex];

          try {
            // Hover over element
            await element.hover();
            await this.randomDelay(200, 800);

            // Sometimes click (but be careful not to navigate away)
            if (Math.random() > 0.8) {
              const tagName = await element.evaluate(el => el.tagName.toLowerCase());
              
              // Only click on safe elements
              if (tagName === 'button' || tagName === 'a') {
                const href = await element.evaluate(el => (el as HTMLAnchorElement).href);
                
                // Don't click external links
                if (!href || href.includes('alibaba.com') || href.includes('aliexpress.com')) {
                  await element.click();
                  await this.randomDelay(1000, 2000);
                }
              }
            }
          } catch (error) {
            // Element might not be clickable, continue
            continue;
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('⚠️ Could not simulate page interactions:', errorMessage);
    }
  }

  /**
   * Simulate typing with natural delays and errors
   */
  async simulateTyping(page: Page, selector: string, text: string): Promise<void> {
    console.log('⌨️ Simulating natural typing...');

    try {
      await page.focus(selector);
      await this.randomDelay(200, 500);

      for (const char of text) {
        await page.keyboard.type(char);
        
        // Natural typing delays
        const baseDelay = Math.random() > 0.9 ? 200 : 50; // Sometimes pause longer
        const randomDelay = Math.random() * 100;
        
        await this.randomDelay(baseDelay, baseDelay + randomDelay);

        // Simulate typing errors (rarely)
        if (this.config.typing.naturalErrors && Math.random() > 0.98) {
          await page.keyboard.press('Backspace');
          await this.randomDelay(100, 300);
          await page.keyboard.type(char);
        }
      }

      // Final pause after typing
      await this.randomDelay(300, 800);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error during typing simulation:', errorMessage);
    }
  }

  /**
   * Simulate form filling
   */
  async simulateFormFilling(page: Page, formData: Record<string, string>): Promise<void> {
    console.log('📝 Simulating form filling...');

    for (const [selector, value] of Object.entries(formData)) {
      try {
        await this.simulateTyping(page, selector, value);
        
        // Move to next field
        await page.keyboard.press('Tab');
        await this.randomDelay(200, 500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`⚠️ Could not fill field ${selector}:`, errorMessage);
      }
    }
  }

  /**
   * Simulate reading behavior
   */
  async simulateReading(page: Page): Promise<void> {
    console.log('📖 Simulating reading behavior...');

    // Get page content length
    const contentLength = await page.evaluate(() => {
      const text = document.body.innerText || '';
      return text.length;
    });

    // Calculate reading time (average reading speed: 200-300 words per minute)
    const wordsPerMinute = Math.floor(Math.random() * 100) + 200;
    const estimatedWords = contentLength / 5; // Rough estimate: 5 characters per word
    const readingTime = (estimatedWords / wordsPerMinute) * 60 * 1000; // Convert to milliseconds

    // Simulate reading with occasional scrolling
    const readingSteps = Math.floor(readingTime / 2000); // Check every 2 seconds

    for (let i = 0; i < readingSteps; i++) {
      await this.randomDelay(1500, 2500);

      // Sometimes scroll while reading
      if (Math.random() > 0.7) {
        await page.evaluate(() => {
          window.scrollBy({
            top: Math.random() * 100 + 50,
            behavior: 'smooth'
          });
        });
      }
    }
  }

  /**
   * Random delay utility
   */
  async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HumanBehaviorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Human behavior configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): HumanBehaviorConfig {
    return { ...this.config };
  }

  /**
   * Enable/disable specific behaviors
   */
  setBehaviorEnabled(behavior: keyof HumanBehaviorConfig, enabled: boolean): void {
    if (behavior === 'delays') {
      console.warn('⚠️ Cannot enable/disable delays behavior');
      return;
    }

    (this.config[behavior] as any).enabled = enabled;
    console.log(`${enabled ? '✅' : '❌'} ${behavior} behavior ${enabled ? 'enabled' : 'disabled'}`);
  }
} 