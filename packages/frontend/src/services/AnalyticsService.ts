import { AREvent } from '@shared';

export class AnalyticsService {
  private backendUrl: string;
  private sessionId: string;
  private userId: string;
  private maxRetries: number = 3;
  private baseRetryDelay: number = 1000; // 1 second
  private eventQueue: AREvent[] = [];
  private isProcessingQueue: boolean = false;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
    this.sessionId = crypto.randomUUID();
    this.userId = crypto.randomUUID();
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getUserId(): string {
    return this.userId;
  }

  async trackAppLaunched(): Promise<void> {
    this.queueEvent({
      timestamp: new Date().toISOString(),
      event_type: 'app_launched',
      session_id: this.sessionId,
      user_id: this.userId,
    });
  }

  async trackModelTapped(modelId: string): Promise<void> {
    this.queueEvent({
      timestamp: new Date().toISOString(),
      event_type: 'model_tapped',
      model_id: modelId,
      session_id: this.sessionId,
      user_id: this.userId,
    });
  }

  async trackTrackingStarted(): Promise<void> {
    this.queueEvent({
      timestamp: new Date().toISOString(),
      event_type: 'tracking_started',
      session_id: this.sessionId,
      user_id: this.userId,
    });
  }

  async trackTrackingLost(): Promise<void> {
    this.queueEvent({
      timestamp: new Date().toISOString(),
      event_type: 'tracking_lost',
      session_id: this.sessionId,
      user_id: this.userId,
    });
  }

  async trackAppClosed(): Promise<void> {
    this.queueEvent({
      timestamp: new Date().toISOString(),
      event_type: 'app_closed',
      session_id: this.sessionId,
      user_id: this.userId,
    });
  }

  async trackCustomEvent(event: AREvent): Promise<void> {
    this.queueEvent(event);
  }

  async trackEvent(eventType: string, data: Record<string, any> = {}): Promise<void> {
    this.queueEvent({
      timestamp: new Date().toISOString(),
      event_type: eventType,
      session_id: this.sessionId,
      user_id: this.userId,
      ...data,
    });
  }

  private queueEvent(event: AREvent): void {
    this.eventQueue.push(event);
    
    // Start processing queue if not already processing
    if (!this.isProcessingQueue) {
      this.processEventQueue();
    }
  }

  private async processEventQueue(): Promise<void> {
    if (this.isProcessingQueue || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    try {
      const event = this.eventQueue.shift();
      if (event) {
        await this.sendEventWithRetry(event);
      }
    } finally {
      this.isProcessingQueue = false;
      
      // If there are more events in the queue, process the next one
      if (this.eventQueue.length > 0) {
        // Add a small delay to prevent overwhelming the server
        setTimeout(() => this.processEventQueue(), 300);
      }
    }
  }

  private async sendEventWithRetry(event: AREvent, retryCount: number = 0): Promise<void> {
    try {
      await this.sendEvent(event);
    } catch (error) {
      // Suppress connection refused/failed to fetch errors in development
      const isNetworkError = error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('ERR_CONNECTION_REFUSED')
      );
      if (isNetworkError) {
        if (process.env.NODE_ENV === 'development') {
          // Only log as debug in dev
          if (typeof console !== 'undefined' && console.debug) {
            console.debug(`AnalyticsService: Network error suppressed in dev:`, error.message, event.event_type);
          }
          return;
        }
      }
      // If it's a rate limit error (429) and we haven't exceeded max retries
      if (error instanceof Error && 
          error.message.includes('429') && 
          retryCount < this.maxRetries) {
        
        // Exponential backoff: delay increases with each retry
        const delay = this.baseRetryDelay * Math.pow(2, retryCount);
        
        // Wait and then retry
        await new Promise(resolve => setTimeout(resolve, delay));
        await this.sendEventWithRetry(event, retryCount + 1);
      } else if (retryCount >= this.maxRetries) {
        // Log but don't rethrow after max retries
        console.warn(`Failed to send analytics event after ${this.maxRetries} retries:`, event.event_type);
      } else {
        // For other errors, just log and continue
        console.warn(`Analytics error (${error instanceof Error ? error.message : 'unknown'}):`, event.event_type);
      }
    }
  }

  private async sendEvent(event: AREvent): Promise<void> {
    const response = await fetch(`${this.backendUrl}/api/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`API error: ${result.error || 'Unknown error'}`);
    }
  }
} 