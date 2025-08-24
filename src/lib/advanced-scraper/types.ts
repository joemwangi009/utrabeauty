export interface ScrapingJob {
  id: string;
  url: string;
  platform: 'alibaba' | 'aliexpress' | 'amazon';
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface ScrapingResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
  confidence: number;
  executionTime: number;
  strategy: string;
  sessionId: string;
  proxyUsed?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: 'http' | 'https' | 'socks5';
  country?: string;
  speed?: number;
  lastUsed?: Date;
  successRate?: number;
  isActive: boolean;
}

export interface SessionData {
  id: string;
  createdAt: Date;
  cookies: any[];
  userAgent: string;
  lastActivity: Date;
  requestCount: number;
  platform: string;
  proxyId?: string;
  isActive: boolean;
}

export interface MobileDevice {
  name: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
    isLandscape: boolean;
  };
  capabilities: {
    hasTouch: boolean;
    hasMouse: boolean;
    hasKeyboard: boolean;
    isMobile: boolean;
  };
}

export interface ScrapingStrategy {
  name: string;
  priority: number;
  successRate: number;
  lastUsed: Date;
  isEnabled: boolean;
  config: Record<string, any>;
}

export interface HumanBehaviorConfig {
  mouseMovement: {
    enabled: boolean;
    minDelay: number;
    maxDelay: number;
    naturalCurves: boolean;
  };
  scrolling: {
    enabled: boolean;
    minScroll: number;
    maxScroll: number;
    scrollDelay: number;
  };
  typing: {
    enabled: boolean;
    minDelay: number;
    maxDelay: number;
    naturalErrors: boolean;
  };
  delays: {
    pageLoad: number;
    actionDelay: number;
    requestDelay: number;
  };
} 