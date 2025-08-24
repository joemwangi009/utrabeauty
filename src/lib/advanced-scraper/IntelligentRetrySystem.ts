import { ScrapingStrategy } from './types';

export class IntelligentRetrySystem {
  private strategies: ScrapingStrategy[] = [
    {
      name: 'stealth',
      priority: 1,
      successRate: 85,
      lastUsed: new Date(),
      isEnabled: true,
      config: { useProxy: false, simulateHuman: true }
    },
    {
      name: 'mobile',
      priority: 2,
      successRate: 75,
      lastUsed: new Date(),
      isEnabled: true,
      config: { useProxy: false, simulateHuman: true }
    },
    {
      name: 'api_interception',
      priority: 3,
      successRate: 60,
      lastUsed: new Date(),
      isEnabled: true,
      config: { useProxy: true, simulateHuman: false }
    },
    {
      name: 'proxy_rotation',
      priority: 4,
      successRate: 70,
      lastUsed: new Date(),
      isEnabled: true,
      config: { useProxy: true, simulateHuman: true }
    },
    {
      name: 'session_refresh',
      priority: 5,
      successRate: 65,
      lastUsed: new Date(),
      isEnabled: true,
      config: { useProxy: false, simulateHuman: true }
    }
  ];

  private failurePatterns = new Map<string, { count: number; lastFailure: Date; strategies: string[] }>();
  private maxRetries = 3;

  /**
   * Execute scraping with intelligent retry
   */
  async executeWithRetry<T>(
    operation: (strategy: ScrapingStrategy) => Promise<T>,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const strategy = this.selectStrategy(attempt);
      
      try {
        console.log(`🔄 Attempt ${attempt}: Using ${strategy.name} strategy`);

        const result = await operation(strategy);
        
        // Update strategy success rate
        this.updateStrategySuccess(strategy.name, true);
        
        console.log(`✅ Operation successful with ${strategy.name} strategy`);
        return result;

      } catch (error) {
        lastError = error as Error;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ Strategy ${strategy.name} failed:`, errorMessage);
        
        // Update strategy success rate
        this.updateStrategySuccess(strategy.name, false);
        
        // Record failure pattern
        this.recordFailurePattern(errorMessage, strategy.name);
        
        // Wait before retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.delay(delay);
        }
      }
    }

    throw new Error(`All strategies failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Select the best strategy for the current attempt
   */
  private selectStrategy(attempt: number): ScrapingStrategy {
    // Sort strategies by priority and success rate
    const availableStrategies = this.strategies
      .filter(s => s.isEnabled)
      .sort((a, b) => {
        // First by priority (higher is better)
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        
        // Then by success rate (higher is better)
        return b.successRate - a.successRate;
      });

    if (availableStrategies.length === 0) {
      throw new Error('No scraping strategies available');
    }

    // For first attempt, use highest priority strategy
    if (attempt === 1) {
      return availableStrategies[0];
    }

    // For subsequent attempts, try different strategies
    const strategyIndex = (attempt - 1) % availableStrategies.length;
    return availableStrategies[strategyIndex];
  }

  /**
   * Update strategy success rate
   */
  private updateStrategySuccess(strategyName: string, success: boolean): void {
    const strategy = this.strategies.find(s => s.name === strategyName);
    if (strategy) {
      // Update last used time
      strategy.lastUsed = new Date();
      
      // Update success rate with exponential moving average
      const alpha = 0.1; // Smoothing factor
      if (success) {
        strategy.successRate = strategy.successRate * (1 - alpha) + 100 * alpha;
      } else {
        strategy.successRate = strategy.successRate * (1 - alpha) + 0 * alpha;
      }
      
      // Ensure success rate stays within bounds
      strategy.successRate = Math.max(0, Math.min(100, strategy.successRate));
    }
  }

  /**
   * Record failure pattern for analysis
   */
  private recordFailurePattern(errorMessage: string, strategyName: string): void {
    const key = this.extractFailureKey(errorMessage);
    const pattern = this.failurePatterns.get(key) || {
      count: 0,
      lastFailure: new Date(),
      strategies: []
    };

    pattern.count++;
    pattern.lastFailure = new Date();
    if (!pattern.strategies.includes(strategyName)) {
      pattern.strategies.push(strategyName);
    }

    this.failurePatterns.set(key, pattern);
  }

  /**
   * Extract failure key from error message
   */
  private extractFailureKey(errorMessage: string): string {
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('timeout')) return 'timeout';
    if (lowerMessage.includes('blocked')) return 'blocked';
    if (lowerMessage.includes('captcha')) return 'captcha';
    if (lowerMessage.includes('rate limit')) return 'rate_limit';
    if (lowerMessage.includes('proxy')) return 'proxy_error';
    if (lowerMessage.includes('network')) return 'network_error';
    if (lowerMessage.includes('not found')) return 'not_found';
    
    return 'unknown';
  }

  /**
   * Get strategy recommendations based on failure patterns
   */
  getStrategyRecommendations(): {
    recommended: ScrapingStrategy[];
    avoid: ScrapingStrategy[];
    insights: string[];
  } {
    const recommendations = {
      recommended: [] as ScrapingStrategy[],
      avoid: [] as ScrapingStrategy[],
      insights: [] as string[]
    };

    // Sort strategies by success rate
    const sortedStrategies = [...this.strategies].sort((a, b) => b.successRate - a.successRate);
    
    // Top 2 strategies are recommended
    recommendations.recommended = sortedStrategies.slice(0, 2);
    
    // Bottom 2 strategies should be avoided
    recommendations.avoid = sortedStrategies.slice(-2);

    // Generate insights based on failure patterns
    for (const [failureType, pattern] of this.failurePatterns.entries()) {
      if (pattern.count > 2) {
        recommendations.insights.push(
          `${failureType} failures detected ${pattern.count} times. Consider adjusting strategy configuration.`
        );
      }
    }

    // Add strategy-specific insights
    for (const strategy of this.strategies) {
      if (strategy.successRate < 50) {
        recommendations.insights.push(
          `${strategy.name} strategy has low success rate (${strategy.successRate}%). Consider disabling or reconfiguring.`
        );
      }
    }

    return recommendations;
  }

  /**
   * Disable problematic strategies
   */
  disableLowPerformingStrategies(threshold: number = 50): void {
    let disabledCount = 0;
    
    for (const strategy of this.strategies) {
      if (strategy.successRate < threshold && strategy.isEnabled) {
        strategy.isEnabled = false;
        disabledCount++;
        console.log(`🚫 Disabled low-performing strategy: ${strategy.name} (${strategy.successRate}% success rate)`);
      }
    }

    if (disabledCount > 0) {
      console.log(`📊 Disabled ${disabledCount} low-performing strategies`);
    }
  }

  /**
   * Re-enable strategies after cooldown
   */
  reenableStrategiesAfterCooldown(cooldownHours: number = 2): void {
    const now = new Date();
    let reenabledCount = 0;
    
    for (const strategy of this.strategies) {
      if (!strategy.isEnabled) {
        const hoursSinceDisabled = (now.getTime() - strategy.lastUsed.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceDisabled >= cooldownHours) {
          strategy.isEnabled = true;
          reenabledCount++;
          console.log(`✅ Re-enabled strategy after cooldown: ${strategy.name}`);
        }
      }
    }

    if (reenabledCount > 0) {
      console.log(`🔄 Re-enabled ${reenabledCount} strategies after cooldown period`);
    }
  }

  /**
   * Get system statistics
   */
  getSystemStats(): {
    totalStrategies: number;
    enabledStrategies: number;
    averageSuccessRate: number;
    totalFailures: number;
    failurePatterns: Record<string, number>;
  } {
    const enabledStrategies = this.strategies.filter(s => s.isEnabled);
    const averageSuccessRate = enabledStrategies.length > 0
      ? enabledStrategies.reduce((sum, s) => sum + s.successRate, 0) / enabledStrategies.length
      : 0;

    const failurePatterns: Record<string, number> = {};
    for (const [key, pattern] of this.failurePatterns.entries()) {
      failurePatterns[key] = pattern.count;
    }

    return {
      totalStrategies: this.strategies.length,
      enabledStrategies: enabledStrategies.length,
      averageSuccessRate: Math.round(averageSuccessRate),
      totalFailures: Array.from(this.failurePatterns.values()).reduce((sum, p) => sum + p.count, 0),
      failurePatterns
    };
  }

  /**
   * Update strategy configuration
   */
  updateStrategyConfig(strategyName: string, config: Partial<ScrapingStrategy['config']>): boolean {
    const strategy = this.strategies.find(s => s.name === strategyName);
    if (strategy) {
      strategy.config = { ...strategy.config, ...config };
      console.log(`⚙️ Updated configuration for strategy: ${strategyName}`);
      return true;
    }
    return false;
  }

  /**
   * Add custom strategy
   */
  addCustomStrategy(strategy: ScrapingStrategy): void {
    // Check if strategy already exists
    const existingIndex = this.strategies.findIndex(s => s.name === strategy.name);
    
    if (existingIndex !== -1) {
      // Update existing strategy
      this.strategies[existingIndex] = { ...strategy, lastUsed: new Date() };
      console.log(`🔄 Updated existing strategy: ${strategy.name}`);
    } else {
      // Add new strategy
      this.strategies.push({ ...strategy, lastUsed: new Date() });
      console.log(`➕ Added custom strategy: ${strategy.name}`);
    }
  }

  /**
   * Remove strategy
   */
  removeStrategy(strategyName: string): boolean {
    const initialLength = this.strategies.length;
    this.strategies = this.strategies.filter(s => s.name !== strategyName);
    const removed = initialLength !== this.strategies.length;
    
    if (removed) {
      console.log(`🗑️ Removed strategy: ${strategyName}`);
    }
    
    return removed;
  }

  /**
   * Delay utility
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 