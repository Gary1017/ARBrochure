import { AnalyticsService } from '../packages/frontend/src/services/AnalyticsService';
import { AREvent } from '../packages/shared/src';

// Mock fetch
global.fetch = jest.fn();

// Mock crypto.randomUUID to return different values
let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => `mock-uuid-${++uuidCounter}`),
  },
  writable: true,
});

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  const mockBackendUrl = 'http://localhost:3001';

  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService = new AnalyticsService(mockBackendUrl);
  });

  describe('Initialization', () => {
    it('should initialize with session and user IDs', () => {
      expect(analyticsService.getSessionId()).toBeDefined();
      expect(analyticsService.getUserId()).toBeDefined();
    });

    it('should generate unique session and user IDs', () => {
      const service1 = new AnalyticsService(mockBackendUrl);
      const service2 = new AnalyticsService(mockBackendUrl);

      expect(service1.getSessionId()).not.toBe(service2.getSessionId());
      expect(service1.getUserId()).not.toBe(service2.getUserId());
    });
  });

  describe('Event Tracking', () => {
    it('should track app launched event', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await analyticsService.trackAppLaunched();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/analytics/events`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('app_launched'),
        })
      );
    });

    it('should track model tapped event', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const modelId = 'test-model-123';
      await analyticsService.trackModelTapped(modelId);

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/analytics/events`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('model_tapped'),
        })
      );
    });

    it('should track tracking started event', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await analyticsService.trackTrackingStarted();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/analytics/events`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('tracking_started'),
        })
      );
    });

    it('should track tracking lost event', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await analyticsService.trackTrackingLost();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/analytics/events`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('tracking_lost'),
        })
      );
    });

    it('should track app closed event', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await analyticsService.trackAppClosed();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/analytics/events`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('app_closed'),
        })
      );
    });

    it('should include correct event data structure', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const modelId = 'test-model-123';
      await analyticsService.trackModelTapped(modelId);

      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody).toMatchObject({
        timestamp: expect.any(String),
        event_type: 'model_tapped',
        model_id: modelId,
        session_id: analyticsService.getSessionId(),
        user_id: analyticsService.getUserId(),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error');
      (fetch as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(analyticsService.trackAppLaunched()).rejects.toThrow('Network error');
    });

    it('should handle server errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(analyticsService.trackAppLaunched()).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle malformed JSON responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(analyticsService.trackAppLaunched()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('Batch Event Sending', () => {
    it('should batch multiple events and send them together', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Track multiple events
      await analyticsService.trackAppLaunched();
      await analyticsService.trackTrackingStarted();
      await analyticsService.trackModelTapped('model-1');

      // Should have made 3 separate calls
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle batch failures gracefully', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      await analyticsService.trackAppLaunched();
      await expect(analyticsService.trackModelTapped('model-1')).rejects.toThrow('Network error');
    });
  });

  describe('Session Management', () => {
    it('should maintain consistent session ID throughout lifecycle', () => {
      const sessionId = analyticsService.getSessionId();
      
      analyticsService.trackAppLaunched();
      analyticsService.trackModelTapped('test-model');
      
      expect(analyticsService.getSessionId()).toBe(sessionId);
    });

    it('should maintain consistent user ID throughout lifecycle', () => {
      const userId = analyticsService.getUserId();
      
      analyticsService.trackAppLaunched();
      analyticsService.trackModelTapped('test-model');
      
      expect(analyticsService.getUserId()).toBe(userId);
    });
  });

  describe('Custom Events', () => {
    it('should allow tracking custom events', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const customEvent: AREvent = {
        timestamp: new Date().toISOString(),
        event_type: 'model_tapped',
        model_id: 'custom-model',
        session_id: analyticsService.getSessionId(),
        user_id: analyticsService.getUserId(),
      };

      await analyticsService.trackCustomEvent(customEvent);

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/analytics/events`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(customEvent),
        })
      );
    });
  });
}); 