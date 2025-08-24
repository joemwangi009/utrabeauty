interface RateLimiterConfig {
  maxRequests: number;
  perMinute: number;
  maxConcurrent: number;
}

export class RateLimiter {
  private config: RateLimiterConfig;
  private requestTimes: number[] = [];
  private activeRequests = 0;
  private lastCleanup = Date.now();

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  /**
   * Wait for a slot to become available
   */
  async waitForSlot(): Promise<void> {
    // Clean up old request times
    this.cleanupOldRequests();

    // Wait for concurrent limit
    while (this.activeRequests >= this.config.maxConcurrent) {
      await this.delay(100);
    }

    // Wait for rate limit
    while (this.requestTimes.length >= this.config.maxRequests) {
      const oldestRequest = this.requestTimes[0];
      const timeSinceOldest = Date.now() - oldestRequest;
      const timeToWait = (60 * 1000) - timeSinceOldest;
      
      if (timeToWait > 0) {
        await this.delay(timeToWait);
      }
      
      this.cleanupOldRequests();
    }

    // Record this request
    this.requestTimes.push(Date.now());
    this.activeRequests++;
  }

  /**
   * Mark request as completed
   */
  markRequestCompleted(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  /**
   * Clean up old request times
   */
  private cleanupOldRequests(): void {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    
    this.requestTimes = this.requestTimes.filter(time => time > oneMinuteAgo);
    
    // Clean up every 5 minutes
    if (now - this.lastCleanup > 5 * 60 * 1000) {
      this.lastCleanup = now;
    }
  }

  /**
   * Get current status
   */
  getStatus(): {
    activeRequests: number;
    queuedRequests: number;
    requestsInLastMinute: number;
    maxConcurrent: number;
    maxRequestsPerMinute: number;
  } {
    this.cleanupOldRequests();
    
    return {
      activeRequests: this.activeRequests,
      queuedRequests: Math.max(0, this.requestTimes.length - this.config.maxRequests),
      requestsInLastMinute: this.requestTimes.length,
      maxConcurrent: this.config.maxConcurrent,
      maxRequestsPerMinute: this.config.maxRequests
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RateLimiterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Rate limiter configuration updated');
  }

  /**
   * Delay utility
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 