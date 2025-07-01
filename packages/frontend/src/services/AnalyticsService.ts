import { AREvent } from '@shared';

export class AnalyticsService {
  private backendUrl: string;
  private sessionId: string;
  private userId: string;

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
    await this.sendEvent({
      timestamp: new Date().toISOString(),
      event_type: 'app_launched',
      session_id: this.sessionId,
      user_id: this.userId,
    });
  }

  async trackModelTapped(modelId: string): Promise<void> {
    await this.sendEvent({
      timestamp: new Date().toISOString(),
      event_type: 'model_tapped',
      model_id: modelId,
      session_id: this.sessionId,
      user_id: this.userId,
    });
  }

  async trackTrackingStarted(): Promise<void> {
    await this.sendEvent({
      timestamp: new Date().toISOString(),
      event_type: 'tracking_started',
      session_id: this.sessionId,
      user_id: this.userId,
    });
  }

  async trackTrackingLost(): Promise<void> {
    await this.sendEvent({
      timestamp: new Date().toISOString(),
      event_type: 'tracking_lost',
      session_id: this.sessionId,
      user_id: this.userId,
    });
  }

  async trackAppClosed(): Promise<void> {
    await this.sendEvent({
      timestamp: new Date().toISOString(),
      event_type: 'app_closed',
      session_id: this.sessionId,
      user_id: this.userId,
    });
  }

  async trackCustomEvent(event: AREvent): Promise<void> {
    await this.sendEvent(event);
  }

  private async sendEvent(event: AREvent): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Failed to send analytics event:', error);
      throw error;
    }
  }
} 