import { AnalyticsService } from '../packages/frontend/src/services/AnalyticsService';
import { ModelManager } from '../packages/frontend/src/services/ModelManager';
import { AREvent } from '../packages/shared/src';

// Mock fetch for analytics
global.fetch = jest.fn();

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-integration-uuid'),
  },
  writable: true,
});

// Mock Three.js for ModelManager
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
  })),
  Group: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    position: { set: jest.fn() },
    rotation: { set: jest.fn() },
    scale: { set: jest.fn() },
    children: [],
  })),
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(),
  })),
  AnimationMixer: jest.fn().mockImplementation(() => ({
    update: jest.fn(),
    clipAction: jest.fn().mockReturnValue({
      play: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    }),
  })),
  Clock: jest.fn().mockImplementation(() => ({
    getDelta: jest.fn(() => 0.016),
  })),
  Vector3: jest.fn().mockImplementation(() => ({
    clone: jest.fn(() => ({ multiplyScalar: jest.fn() })),
    multiplyScalar: jest.fn(() => ({})),
    lerpVectors: jest.fn(),
    copy: jest.fn(),
  })),
}));

describe('Integration Tests', () => {
  let analyticsService: AnalyticsService;
  let modelManager: ModelManager;
  
  const mockScene = {
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
  };

  const mockCamera = {
    position: { set: jest.fn() },
    lookAt: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService = new AnalyticsService('http://localhost:3001');
    modelManager = new ModelManager(mockScene as any, mockCamera as any);
  });

  describe('Analytics and ModelManager Integration', () => {
    it('should track analytics when models are interacted with', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Simulate model tap that triggers analytics
      const modelId = 'integration-test-model';
      
      // This would typically be called from the AR scene when a model is tapped
      await analyticsService.trackModelTapped(modelId);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analytics/events',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('model_tapped'),
        })
      );
    });

    it('should handle end-to-end AR session workflow', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Simulate a complete AR session workflow
      await analyticsService.trackAppLaunched();
      await analyticsService.trackTrackingStarted();
      
      // Simulate multiple model interactions
      await analyticsService.trackModelTapped('model-1');
      await analyticsService.trackModelTapped('model-2');
      
      await analyticsService.trackTrackingLost();
      await analyticsService.trackAppClosed();

      // Verify all events were tracked
      expect(fetch).toHaveBeenCalledTimes(6);
    });
  });

  describe('Service Lifecycle Integration', () => {
    it('should maintain consistent state across service interactions', () => {
      const sessionId = analyticsService.getSessionId();
      const userId = analyticsService.getUserId();

      // Verify session consistency
      expect(analyticsService.getSessionId()).toBe(sessionId);
      expect(analyticsService.getUserId()).toBe(userId);

      // ModelManager should be functional
      expect(modelManager.getAllModels()).toEqual([]);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service failures gracefully in integrated environment', async () => {
      // Mock network failure
      (fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

      // Analytics should handle failures without breaking the app
      await expect(analyticsService.trackAppLaunched()).rejects.toThrow('Network failure');

      // ModelManager should continue to work despite analytics failures
      expect(modelManager.getAllModels()).toEqual([]);
    });
  });
}); 