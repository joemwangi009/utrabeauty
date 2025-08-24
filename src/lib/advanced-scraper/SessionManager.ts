import { SessionData } from './types';

export class SessionManager {
  private sessions = new Map<string, SessionData>();
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  ];

  /**
   * Create a new session
   */
  async createSession(platform?: string): Promise<string> {
    const sessionId = this.generateSessionId();
    const userAgent = this.getRandomUserAgent();
    
    const session: SessionData = {
      id: sessionId,
      createdAt: new Date(),
      cookies: [],
      userAgent,
      lastActivity: new Date(),
      requestCount: 0,
      platform: platform || 'unknown',
      isActive: true
    };

    this.sessions.set(sessionId, session);
    console.log(`🆕 Created new session: ${sessionId} for platform: ${platform || 'unknown'}`);
    
    return sessionId;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Update session activity
   */
  updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      session.requestCount++;
      
      // Rotate user agent after certain number of requests
      if (session.requestCount % 50 === 0) {
        session.userAgent = this.getRandomUserAgent();
        console.log(`🔄 Rotated user agent for session ${sessionId}`);
      }
    }
  }

  /**
   * Add cookies to session
   */
  addCookies(sessionId: string, cookies: any[]): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.cookies = [...session.cookies, ...cookies];
      console.log(`🍪 Added ${cookies.length} cookies to session ${sessionId}`);
    }
  }

  /**
   * Get cookies for session
   */
  getCookies(sessionId: string): any[] {
    const session = this.sessions.get(sessionId);
    return session ? session.cookies : [];
  }

  /**
   * Clear cookies for session
   */
  clearCookies(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.cookies = [];
      console.log(`🧹 Cleared cookies for session ${sessionId}`);
    }
  }

  /**
   * Deactivate session
   */
  deactivateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      console.log(`❌ Deactivated session ${sessionId}`);
    }
  }

  /**
   * Reactivate session
   */
  reactivateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = true;
      session.lastActivity = new Date();
      console.log(`✅ Reactivated session ${sessionId}`);
    }
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): SessionData[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return this.getActiveSessions().length;
  }

  /**
   * Clean up old sessions
   */
  cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000): void { // Default: 24 hours
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now.getTime() - session.createdAt.getTime();
      if (age > maxAge) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old sessions`);
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    total: number;
    active: number;
    inactive: number;
    averageAge: number;
    totalRequests: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const active = sessions.filter(s => s.isActive).length;
    const inactive = sessions.length - active;
    
    const totalRequests = sessions.reduce((sum, s) => sum + s.requestCount, 0);
    const averageAge = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (Date.now() - s.createdAt.getTime()), 0) / sessions.length
      : 0;

    return {
      total: sessions.length,
      active,
      inactive,
      averageAge: Math.round(averageAge / (1000 * 60 * 60)), // Convert to hours
      totalRequests
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get random user agent
   */
  private getRandomUserAgent(): string {
    const randomIndex = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[randomIndex];
  }

  /**
   * Add custom user agent
   */
  addUserAgent(userAgent: string): void {
    this.userAgents.push(userAgent);
    console.log(`➕ Added custom user agent: ${userAgent.substring(0, 50)}...`);
  }

  /**
   * Remove user agent
   */
  removeUserAgent(userAgent: string): boolean {
    const initialLength = this.userAgents.length;
    this.userAgents = this.userAgents.filter(ua => ua !== userAgent);
    const removed = initialLength !== this.userAgents.length;
    
    if (removed) {
      console.log(`🗑️ Removed user agent: ${userAgent.substring(0, 50)}...`);
    }
    
    return removed;
  }

  /**
   * Get all user agents
   */
  getUserAgents(): string[] {
    return [...this.userAgents];
  }
} 