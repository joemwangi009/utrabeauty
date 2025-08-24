import { ScrapingJob } from './types';

export class ScrapingQueue {
  private queue: ScrapingJob[] = [];
  private processing = false;
  private maxRetries = 3;

  /**
   * Add a job to the queue
   */
  async addJob(job: ScrapingJob): Promise<void> {
    this.queue.push(job);
    console.log(`📥 Added job to queue: ${job.url} (Priority: ${job.priority})`);
    
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    this.processing = true;
    console.log(`🔄 Starting queue processing with ${this.queue.length} jobs`);

    while (this.queue.length > 0) {
      const job = this.getNextJob();
      if (job) {
        try {
          console.log(`⚡ Processing job: ${job.url}`);
          await this.processJob(job);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Job processing failed: ${job.url}`, errorMessage);
          await this.handleJobFailure(job);
        }
      }
    }

    this.processing = false;
    console.log('✅ Queue processing completed');
  }

  /**
   * Get the next job based on priority
   */
  private getNextJob(): ScrapingJob | undefined {
    if (this.queue.length === 0) return undefined;

    // Sort by priority and creation time
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return this.queue.shift();
  }

  /**
   * Process a single job
   */
  private async processJob(job: ScrapingJob): Promise<void> {
    // Update job status
    job.status = 'processing';
    
    // Simulate job processing (in real implementation, this would call the scraper)
    await this.delay(1000);
    
    // Mark job as completed
    job.status = 'completed';
    console.log(`✅ Job completed: ${job.url}`);
  }

  /**
   * Handle job failure
   */
  private async handleJobFailure(job: ScrapingJob): Promise<void> {
    job.retryCount++;
    
    if (job.retryCount < job.maxRetries) {
      console.log(`🔄 Retrying job: ${job.url} (Attempt ${job.retryCount}/${job.maxRetries})`);
      
      // Add back to queue with lower priority
      job.priority = this.downgradePriority(job.priority);
      job.status = 'pending';
      this.queue.push(job);
    } else {
      job.status = 'failed';
      console.log(`💀 Job failed permanently: ${job.url}`);
    }
  }

  /**
   * Downgrade job priority
   */
  private downgradePriority(priority: 'high' | 'medium' | 'low'): 'high' | 'medium' | 'low' {
    switch (priority) {
      case 'high':
        return 'medium';
      case 'medium':
        return 'low';
      default:
        return 'low';
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    byPriority: Record<string, number>;
  } {
    const stats = {
      total: this.queue.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      byPriority: { high: 0, medium: 0, low: 0 }
    };

    for (const job of this.queue) {
      stats[job.status]++;
      stats.byPriority[job.priority]++;
    }

    return stats;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Clear the queue
   */
  clearQueue(): void {
    const count = this.queue.length;
    this.queue = [];
    console.log(`🧹 Cleared ${count} jobs from queue`);
  }

  /**
   * Remove a specific job
   */
  removeJob(jobId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(job => job.id !== jobId);
    const removed = initialLength !== this.queue.length;
    
    if (removed) {
      console.log(`🗑️ Removed job: ${jobId}`);
    }
    
    return removed;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): ScrapingJob | undefined {
    return this.queue.find(job => job.id === jobId);
  }

  /**
   * Update job priority
   */
  updateJobPriority(jobId: string, newPriority: 'high' | 'medium' | 'low'): boolean {
    const job = this.getJob(jobId);
    if (job) {
      job.priority = newPriority;
      console.log(`⚡ Updated job priority: ${jobId} -> ${newPriority}`);
      return true;
    }
    return false;
  }

  /**
   * Delay utility
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 