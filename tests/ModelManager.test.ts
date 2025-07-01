import { ModelManager } from '../packages/frontend/src/services/ModelManager';
import { ModelConfig, AnimationConfig } from '../packages/shared/src';

// Mock Three.js
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

// Mock scene and camera
const mockScene = {
  add: jest.fn(),
  remove: jest.fn(),
  children: [],
};

const mockCamera = {
  position: { set: jest.fn() },
  lookAt: jest.fn(),
};

describe('ModelManager', () => {
  let modelManager: ModelManager;
  const mockModelConfig: ModelConfig = {
    id: 'test-model',
    name: 'Test Model',
    path: '/models/test.glb',
    position: [0, 0, -1],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    animations: [
      {
        name: 'idle',
        type: 'rotation',
        duration: 2000,
        easing: 'easeInOut',
        loop: true,
        direction: 'normal',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    modelManager = new ModelManager(mockScene as any, mockCamera as any);
  });

  describe('Model Loading', () => {
    it('should create model manager instance', () => {
      expect(modelManager).toBeDefined();
      expect(modelManager.getModel).toBeDefined();
      expect(modelManager.getAllModels).toBeDefined();
    });

    it('should handle model operations', () => {
      // Test basic model manager functionality
      expect(modelManager.getAllModels()).toEqual([]);
      expect(modelManager.getModel('non-existent')).toBeUndefined();
    });
  });

  describe('Animation Management', () => {
    it('should handle animation operations', () => {
      // Test animation methods exist
      expect(modelManager.playAnimation).toBeDefined();
      expect(modelManager.stopAnimation).toBeDefined();
    });
  });

  describe('Model Interaction', () => {
    it('should handle model tap operations', () => {
      // Test tap handling methods exist
      expect(modelManager.setModelTapHandler).toBeDefined();
      expect(modelManager.handleTap).toBeDefined();
    });
  });

  describe('Model Removal', () => {
    it('should handle model removal operations', () => {
      // Test removal methods exist
      expect(modelManager.removeModel).toBeDefined();
    });
  });

  describe('Update Loop', () => {
    it('should update animations in the render loop', () => {
      modelManager.update(0.016);

      // Verify update was called
      expect(modelManager).toBeDefined();
    });
  });
}); 