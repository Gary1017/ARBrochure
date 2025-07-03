/**
 * @jest-environment node
 */
import { AnalyticsService } from '../AnalyticsService';
import { AREvent } from '@shared/index';

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
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error');
      (fetch as jest.Mock).mockRejectedValueOnce(mockError);

      // Should not throw, but should log warning
      await expect(analyticsService.trackAppLaunched()).resolves.toBeUndefined();
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Analytics error (Network error):', 'app_launched');
    });

    it('should handle server errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // Should not throw, but should log warning
      await expect(analyticsService.trackAppLaunched()).resolves.toBeUndefined();
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Analytics error (HTTP error! status: 500):', 'app_launched');
    });

    it('should handle malformed JSON responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      // Should not throw, but should log warning
      await expect(analyticsService.trackAppLaunched()).resolves.toBeUndefined();
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Analytics error (Invalid JSON):', 'app_launched');
    });

    it('should handle API errors from backend', async () => {
      const mockResponse = { success: false, error: 'Invalid event data' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Should not throw, but should log warning
      await expect(analyticsService.trackAppLaunched()).resolves.toBeUndefined();
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Analytics error (API error: Invalid event data):', 'app_launched');
    });

    it('should handle API errors without error message', async () => {
      const mockResponse = { success: false };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Should not throw, but should log warning
      await expect(analyticsService.trackAppLaunched()).resolves.toBeUndefined();
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Analytics error (API error: Unknown error):', 'app_launched');
    });
  });

  describe('Custom Events', () => {
    it('should track custom events', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const customEvent: AREvent = {
        timestamp: new Date().toISOString(),
        event_type: 'app_launched',
        session_id: analyticsService.getSessionId(),
        user_id: analyticsService.getUserId(),
      };

      await analyticsService.trackCustomEvent(customEvent);

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/analytics/events`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(customEvent),
        })
      );
    });
  });

  describe('Rate Limiting Handling', () => {
    let fetchMock: jest.SpyInstance;
    
    beforeEach(() => {
      fetchMock = jest.spyOn(global, 'fetch').mockImplementation();
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      fetchMock.mockRestore();
      jest.useRealTimers();
    });
    
    it('should handle 429 rate limiting with retry logic', async () => {
      // First call returns 429
      fetchMock.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ success: false, error: 'Rate limit exceeded' })
        } as Response)
      );
      
      // Second call succeeds
      fetchMock.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true })
        } as Response)
      );
      
      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Track an event
      analyticsService.trackAppLaunched();
      
      // Wait for initial processing
      await Promise.resolve();
      
      // Fast-forward time to trigger retry
      jest.advanceTimersByTime(1000);
      
      // Wait for promises to resolve
      await Promise.resolve();
      
      // Verify fetch was called twice (initial + retry)
      expect(fetchMock).toHaveBeenCalledTimes(2);
      
      // Verify no warnings were logged (successful retry)
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
    
    it('should give up after max retries and log a warning', async () => {
      // Mock multiple 429 responses
      fetchMock.mockImplementation(() => 
        Promise.resolve({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ success: false, error: 'Rate limit exceeded' })
        } as Response)
      );
      
      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Track an event
      analyticsService.trackAppLaunched();
      
      // Wait for initial processing
      await Promise.resolve();
      
      // Fast-forward time for all retries (1s, 2s, 4s)
      jest.advanceTimersByTime(1000); // First retry
      await Promise.resolve();
      jest.advanceTimersByTime(2000); // Second retry
      await Promise.resolve();
      jest.advanceTimersByTime(4000); // Third retry
      await Promise.resolve();
      
      // Should have called fetch 4 times (initial + 3 retries)
      expect(fetchMock).toHaveBeenCalledTimes(4);
      
      // Should have logged a warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send analytics event after 3 retries:'),
        'app_launched'
      );
      
      consoleWarnSpy.mockRestore();
    });
    
    it('should process events in queue with delay between them', async () => {
      // Mock successful responses
      fetchMock.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true })
        } as Response)
      );
      
      // Track multiple events
      analyticsService.trackAppLaunched();
      analyticsService.trackTrackingStarted();
      analyticsService.trackTrackingLost();
      
      // Wait for initial processing
      await Promise.resolve();
      
      // First event should be processed immediately
      expect(fetchMock).toHaveBeenCalledTimes(1);
      
      // Fast-forward time for queue processing
      jest.advanceTimersByTime(300);
      await Promise.resolve();
      
      // Second event should be processed
      expect(fetchMock).toHaveBeenCalledTimes(2);
      
      // Fast-forward time for next queue item
      jest.advanceTimersByTime(300);
      await Promise.resolve();
      
      // Third event should be processed
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });
}); 