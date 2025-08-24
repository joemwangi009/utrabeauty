import { ProxyConfig } from './types';

export class ProxyManager {
  private proxyList: ProxyConfig[] = [];
  private currentIndex = 0;
  private failedProxies = new Map<string, { count: number; lastFailed: Date }>();
  private maxFailures = 3;
  private failureTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeDefaultProxies();
  }

  /**
   * Initialize with default proxy configurations
   */
  private initializeDefaultProxies(): void {
    // Add some default proxy configurations
    // In production, these would come from your proxy service
    this.addProxy({
      host: 'proxy1.example.com',
      port: 8080,
      protocol: 'http',
      country: 'US',
      speed: 100,
      isActive: true
    });

    this.addProxy({
      host: 'proxy2.example.com',
      port: 8080,
      protocol: 'http',
      country: 'UK',
      speed: 150,
      isActive: true
    });

    this.addProxy({
      host: 'proxy3.example.com',
      port: 8080,
      protocol: 'https',
      country: 'DE',
      speed: 120,
      isActive: true
    });
  }

  /**
   * Add a new proxy to the list
   */
  addProxy(proxy: ProxyConfig): void {
    // Validate proxy configuration
    if (!this.isValidProxy(proxy)) {
      throw new Error('Invalid proxy configuration');
    }

    // Check if proxy already exists
    const existingIndex = this.proxyList.findIndex(
      p => p.host === proxy.host && p.port === proxy.port
    );

    if (existingIndex !== -1) {
      // Update existing proxy
      this.proxyList[existingIndex] = { ...proxy, lastUsed: new Date() };
      console.log(`🔄 Updated existing proxy: ${proxy.host}:${proxy.port}`);
    } else {
      // Add new proxy
      this.proxyList.push({ ...proxy, lastUsed: new Date() });
      console.log(`➕ Added new proxy: ${proxy.host}:${proxy.port}`);
    }
  }

  /**
   * Remove a proxy by host and port
   */
  removeProxy(host: string, port: number): boolean {
    const initialLength = this.proxyList.length;
    this.proxyList = this.proxyList.filter(
      p => !(p.host === host && p.port === port)
    );
    
    const removed = initialLength !== this.proxyList.length;
    if (removed) {
      console.log(`🗑️ Removed proxy: ${host}:${port}`);
    }
    
    return removed;
  }

  /**
   * Get the next available proxy
   */
  async getNextProxy(): Promise<ProxyConfig | null> {
    const availableProxies = this.proxyList.filter(p => p.isActive);
    
    if (availableProxies.length === 0) {
      console.warn('⚠️ No active proxies available');
      return null;
    }

    // Try to find a working proxy
    for (let i = 0; i < availableProxies.length; i++) {
      const proxy = availableProxies[this.currentIndex % availableProxies.length];
      this.currentIndex++;

      // Check if proxy has failed too many times recently
      if (!this.isProxyBlocked(proxy)) {
        // Test proxy before returning
        if (await this.testProxy(proxy)) {
          proxy.lastUsed = new Date();
          console.log(`🌐 Using proxy: ${proxy.host}:${proxy.port} (${proxy.country})`);
          return proxy;
        } else {
          this.markProxyFailed(proxy);
        }
      }
    }

    console.warn('⚠️ All proxies are currently blocked or failed');
    return null;
  }

  /**
   * Get a proxy by country
   */
  async getProxyByCountry(country: string): Promise<ProxyConfig | null> {
    const countryProxies = this.proxyList.filter(
      p => p.isActive && p.country?.toUpperCase() === country.toUpperCase()
    );

    if (countryProxies.length === 0) {
      console.warn(`⚠️ No proxies available for country: ${country}`);
      return null;
    }

    // Test and return the first working proxy
    for (const proxy of countryProxies) {
      if (!this.isProxyBlocked(proxy) && await this.testProxy(proxy)) {
        proxy.lastUsed = new Date();
        console.log(`🌍 Using country-specific proxy: ${proxy.host}:${proxy.port} (${proxy.country})`);
        return proxy;
      }
    }

    return null;
  }

  /**
   * Test if a proxy is working
   */
  async testProxy(proxy: ProxyConfig): Promise<boolean> {
    try {
      const testUrl = 'https://httpbin.org/ip';
      const timeout = 10000; // 10 seconds

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(testUrl, {
        signal: controller.signal,
        // Note: In a real implementation, you'd use a proper proxy agent
        // This is a simplified version for demonstration
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Proxy test successful: ${proxy.host}:${proxy.port}`);
        
        // Update proxy success rate
        if (proxy.successRate === undefined) {
          proxy.successRate = 100;
        } else {
          proxy.successRate = Math.min(100, proxy.successRate + 5);
        }
        
        return true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Proxy test failed: ${proxy.host}:${proxy.port} - ${errorMessage}`);
      
      // Update proxy success rate
      if (proxy.successRate === undefined) {
        proxy.successRate = 0;
      } else {
        proxy.successRate = Math.max(0, proxy.successRate - 10);
      }
    }

    return false;
  }

  /**
   * Mark a proxy as failed
   */
  markProxyFailed(proxy: ProxyConfig): void {
    const key = `${proxy.host}:${proxy.port}`;
    const current = this.failedProxies.get(key) || { count: 0, lastFailed: new Date() };
    
    current.count++;
    current.lastFailed = new Date();
    
    this.failedProxies.set(key, current);
    
    console.log(`❌ Proxy marked as failed: ${proxy.host}:${proxy.port} (${current.count}/${this.maxFailures})`);
    
    // Deactivate proxy if it has failed too many times
    if (current.count >= this.maxFailures) {
      proxy.isActive = false;
      console.log(`🚫 Proxy deactivated due to repeated failures: ${proxy.host}:${proxy.port}`);
    }
  }

  /**
   * Check if a proxy is blocked
   */
  private isProxyBlocked(proxy: ProxyConfig): boolean {
    const key = `${proxy.host}:${proxy.port}`;
    const failed = this.failedProxies.get(key);
    
    if (!failed) return false;
    
    // Check if enough time has passed to retry
    const timeSinceLastFailure = Date.now() - failed.lastFailed.getTime();
    return timeSinceLastFailure < this.failureTimeout;
  }

  /**
   * Validate proxy configuration
   */
  private isValidProxy(proxy: ProxyConfig): boolean {
    return !!(
      proxy.host &&
      proxy.port &&
      proxy.port > 0 &&
      proxy.port <= 65535 &&
      ['http', 'https', 'socks5'].includes(proxy.protocol)
    );
  }

  /**
   * Get proxy statistics
   */
  getProxyStats(): {
    total: number;
    active: number;
    failed: number;
    averageSuccessRate: number;
  } {
    const active = this.proxyList.filter(p => p.isActive).length;
    const failed = this.proxyList.filter(p => !p.isActive).length;
    
    const successRates = this.proxyList
      .filter(p => p.successRate !== undefined)
      .map(p => p.successRate!);
    
    const averageSuccessRate = successRates.length > 0
      ? successRates.reduce((a, b) => a + b, 0) / successRates.length
      : 0;

    return {
      total: this.proxyList.length,
      active,
      failed,
      averageSuccessRate: Math.round(averageSuccessRate)
    };
  }

  /**
   * Refresh proxy list from external source
   */
  async refreshProxyList(): Promise<void> {
    console.log('🔄 Refreshing proxy list...');
    
    try {
      // In production, this would fetch from your proxy service API
      // For now, we'll just test existing proxies
      const activeProxies = this.proxyList.filter(p => p.isActive);
      
      for (const proxy of activeProxies) {
        await this.testProxy(proxy);
        await this.delay(1000); // Delay between tests
      }
      
      console.log('✅ Proxy list refresh completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to refresh proxy list:', errorMessage);
    }
  }

  /**
   * Get all proxies
   */
  getAllProxies(): ProxyConfig[] {
    return [...this.proxyList];
  }

  /**
   * Get active proxies only
   */
  getActiveProxies(): ProxyConfig[] {
    return this.proxyList.filter(p => p.isActive);
  }

  /**
   * Clear failed proxy records
   */
  clearFailedRecords(): void {
    this.failedProxies.clear();
    console.log('🧹 Cleared failed proxy records');
  }

  /**
   * Delay utility
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 