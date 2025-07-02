/**
 * @jest-environment node
 */
import { ModelManager } from '../ModelManager';
import { ModelConfig, AnimationConfig } from '@shared/index';

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
    scale: {
      set: jest.fn(),
      clone: jest.fn(() => ({
        clone: jest.fn().mockReturnThis(),
        multiplyScalar: jest.fn().mockReturnThis(),
        copy: jest.fn().mockReturnThis(),
      })),
      copy: jest.fn().mockReturnThis(),
      multiplyScalar: jest.fn().mockReturnThis(),
    },
    children: [],
    traverse: jest.fn(),
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
    stopAllAction: jest.fn(),
  })),
  Clock: jest.fn().mockImplementation(() => ({
    getDelta: jest.fn(() => 0.016),
  })),
  Vector3: jest.fn().mockImplementation(() => ({
    clone: jest.fn(() => ({ multiplyScalar: jest.fn(() => ({})), copy: jest.fn() })),
    multiplyScalar: jest.fn(() => ({})),
    lerpVectors: jest.fn(),
    copy: jest.fn(),
  })),
  Mesh: jest.fn(),
  Object3D: jest.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

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

// Helper function to create a properly mocked Group
const createMockGroup = () => ({
  add: jest.fn(),
  remove: jest.fn(),
  position: { set: jest.fn() },
  rotation: { set: jest.fn() },
  scale: {
    set: jest.fn(),
    clone: jest.fn(() => ({
      clone: jest.fn().mockReturnThis(),
      multiplyScalar: jest.fn().mockReturnThis(),
      copy: jest.fn().mockReturnThis(),
    })),
    copy: jest.fn().mockReturnThis(),
    multiplyScalar: jest.fn().mockReturnThis(),
  },
  children: [],
  traverse: jest.fn(),
});

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
    it('should load model successfully', async () => {
      const mockGLTF = {
        scene: createMockGroup(),
        animations: [
          { name: 'idle' },
        ],
      };

      const mockLoader = {
        load: jest.fn((path, onLoad, onProgress, onError) => {
          onLoad(mockGLTF);
        }),
      };

      require('three').GLTFLoader.mockImplementation(() => mockLoader);

      const result = await modelManager.loadModel(mockModelConfig);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockModelConfig.id);
      expect(result.config).toBe(mockModelConfig);
      expect(mockScene.add).toHaveBeenCalled();
    });

    it('should handle model loading errors', async () => {
      const mockLoader = {
        load: jest.fn((path, onLoad, onProgress, onError) => {
          onError(new Error('Failed to load model'));
        }),
      };

      require('three').GLTFLoader.mockImplementation(() => mockLoader);

      await expect(modelManager.loadModel(mockModelConfig)).rejects.toThrow('Failed to load model');
    });

    it('should position model according to config', async () => {
      const mockGLTF = {
        scene: createMockGroup(),
        animations: [],
      };

      const mockGroup = {
        add: jest.fn(),
        remove: jest.fn(),
        position: { set: jest.fn() },
        rotation: { set: jest.fn() },
        scale: { set: jest.fn() },
        children: [],
        traverse: jest.fn(),
      };

      require('three').Group.mockImplementation(() => mockGroup);

      const mockLoader = {
        load: jest.fn((path, onLoad) => {
          onLoad(mockGLTF);
        }),
      };

      require('three').GLTFLoader.mockImplementation(() => mockLoader);

      await modelManager.loadModel(mockModelConfig);

      expect(mockGroup.position.set).toHaveBeenCalledWith(0, 0, -1);
      expect(mockGroup.rotation.set).toHaveBeenCalledWith(0, 0, 0);
      expect(mockGroup.scale.set).toHaveBeenCalledWith(1, 1, 1);
    });

    it('should setup animations when model has animations', async () => {
      const mockGLTF = {
        scene: createMockGroup(),
        animations: [
          { name: 'idle' },
          { name: 'walk' },
        ],
      };

      const mockMixer = {
        update: jest.fn(),
        clipAction: jest.fn().mockReturnValue({
          play: jest.fn(),
          stop: jest.fn(),
          reset: jest.fn(),
        }),
        stopAllAction: jest.fn(),
      };

      require('three').AnimationMixer.mockImplementation(() => mockMixer);

      const mockLoader = {
        load: jest.fn((path, onLoad) => {
          onLoad(mockGLTF);
        }),
      };

      require('three').GLTFLoader.mockImplementation(() => mockLoader);

      await modelManager.loadModel(mockModelConfig);

      expect(require('three').AnimationMixer).toHaveBeenCalled();
      expect(mockMixer.clipAction).toHaveBeenCalledTimes(2);
    });
  });

  describe('Animation Management', () => {
    beforeEach(async () => {
      // Setup a model with animations
      const mockGLTF = {
        scene: createMockGroup(),
        animations: [{ name: 'idle' }],
      };

      const mockMixer = {
        update: jest.fn(),
        clipAction: jest.fn().mockReturnValue({
          play: jest.fn(),
          stop: jest.fn(),
          reset: jest.fn(),
        }),
        stopAllAction: jest.fn(),
      };

      require('three').AnimationMixer.mockImplementation(() => mockMixer);

      const mockLoader = {
        load: jest.fn((path, onLoad) => onLoad(mockGLTF)),
      };

      require('three').GLTFLoader.mockImplementation(() => mockLoader);
      await modelManager.loadModel(mockModelConfig);
    });

    it('should play animation successfully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      modelManager.playAnimation('test-model', 'idle');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should warn when animation not found', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      modelManager.playAnimation('test-model', 'nonexistent');

      expect(consoleSpy).toHaveBeenCalledWith('Animation "nonexistent" not found for model: test-model');
      consoleSpy.mockRestore();
    });

    it('should warn when model has no animations', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      modelManager.playAnimation('nonexistent-model', 'idle');

      expect(consoleSpy).toHaveBeenCalledWith('No animations found for model: nonexistent-model');
      consoleSpy.mockRestore();
    });

    it('should stop animation successfully', () => {
      modelManager.stopAnimation('test-model', 'idle');
      // Should not throw any errors
      expect(true).toBe(true);
    });

    it('should handle stopping animation for non-existent model', () => {
      modelManager.stopAnimation('nonexistent-model', 'idle');
      // Should not throw any errors
      expect(true).toBe(true);
    });
  });

  describe('Model Interaction', () => {
    it('should set tap handler for model', () => {
      const mockHandler = jest.fn();
      modelManager.setModelTapHandler('test-model', mockHandler);

      // Handler should be stored (we can't directly access private property, but we can test through handleTap)
      expect(modelManager.setModelTapHandler).toBeDefined();
    });

    it('should handle tap and call registered handler', () => {
      const mockHandler = jest.fn();
      modelManager.setModelTapHandler('test-model', mockHandler);

      modelManager.handleTap('test-model');

      expect(mockHandler).toHaveBeenCalledWith('test-model');
    });

    it('should not call handler for unregistered model', () => {
      const mockHandler = jest.fn();
      modelManager.setModelTapHandler('test-model', mockHandler);

      modelManager.handleTap('nonexistent-model');

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should provide visual feedback on tap', async () => {
      // First load a model
      const mockGLTF = {
        scene: createMockGroup(),
        animations: [],
      };

      const mockLoader = {
        load: jest.fn((path, onLoad) => onLoad(mockGLTF)),
      };

      require('three').GLTFLoader.mockImplementation(() => mockLoader);
      await modelManager.loadModel(mockModelConfig);

      // Patch model.scene.scale to have a clone method
      const model = modelManager.getModel('test-model');
      if (model) {
        (model.scene as any).scale = {
          set: jest.fn(),
          clone: jest.fn(() => ({
            clone: jest.fn().mockReturnThis(),
            multiplyScalar: jest.fn().mockReturnThis(),
            copy: jest.fn().mockReturnThis(),
          })),
          copy: jest.fn().mockReturnThis(),
          multiplyScalar: jest.fn().mockReturnThis(),
        };
      }

      const mockHandler = jest.fn();
      modelManager.setModelTapHandler('test-model', mockHandler);

      // Mock requestAnimationFrame to capture the visual feedback animation
      const mockRAF = jest.fn();
      global.requestAnimationFrame = mockRAF;

      modelManager.handleTap('test-model');

      expect(mockRAF).toHaveBeenCalled();
    });
  });

  describe('Model Removal', () => {
    it('should remove model and cleanup resources', async () => {
      // First load a model
      const mockGLTF = {
        scene: createMockGroup(),
        animations: [{ name: 'idle' }],
      };

      const mockMixer = {
        update: jest.fn(),
        clipAction: jest.fn().mockReturnValue({
          play: jest.fn(),
          stop: jest.fn(),
          reset: jest.fn(),
        }),
        stopAllAction: jest.fn(),
      };

      require('three').AnimationMixer.mockImplementation(() => mockMixer);

      const mockLoader = {
        load: jest.fn((path, onLoad) => onLoad(mockGLTF)),
      };

      require('three').GLTFLoader.mockImplementation(() => mockLoader);
      await modelManager.loadModel(mockModelConfig);

      // Set up a tap handler
      const mockHandler = jest.fn();
      modelManager.setModelTapHandler('test-model', mockHandler);

      // Remove the model
      modelManager.removeModel('test-model');

      expect(mockScene.remove).toHaveBeenCalled();
      expect(mockMixer.stopAllAction).toHaveBeenCalled();
    });

    it('should handle removing non-existent model', () => {
      modelManager.removeModel('nonexistent-model');
      // Should not throw any errors
      expect(true).toBe(true);
    });
  });

  describe('Update Loop', () => {
    it('should update animation mixers', async () => {
      // Setup a model with animations
      const mockGLTF = {
        scene: createMockGroup(),
        animations: [{ name: 'idle' }],
      };

      const mockMixer = {
        update: jest.fn(),
        clipAction: jest.fn().mockReturnValue({
          play: jest.fn(),
          stop: jest.fn(),
          reset: jest.fn(),
        }),
        stopAllAction: jest.fn(),
      };

      require('three').AnimationMixer.mockImplementation(() => mockMixer);

      const mockLoader = {
        load: jest.fn((path, onLoad) => onLoad(mockGLTF)),
      };

      require('three').GLTFLoader.mockImplementation(() => mockLoader);
      await modelManager.loadModel(mockModelConfig);

      modelManager.update(0.016);

      expect(mockMixer.update).toHaveBeenCalledWith(0.016);
    });

    it('should handle update with no models', () => {
      modelManager.update(0.016);
      // Should not throw any errors
      expect(true).toBe(true);
    });
  });

  describe('Model Retrieval', () => {
    it('should get model by ID', async () => {
      const mockGLTF = {
        scene: createMockGroup(),
        animations: [],
      };

      const mockLoader = {
        load: jest.fn((path, onLoad) => onLoad(mockGLTF)),
      };

      require('three').GLTFLoader.mockImplementation(() => mockLoader);
      await modelManager.loadModel(mockModelConfig);

      const model = modelManager.getModel('test-model');
      expect(model).toBeDefined();
      expect(model?.id).toBe('test-model');
    });

    it('should return undefined for non-existent model', () => {
      const model = modelManager.getModel('nonexistent');
      expect(model).toBeUndefined();
    });

    it('should get all models', async () => {
      const mockGLTF = {
        scene: createMockGroup(),
        animations: [],
      };

      const mockLoader = {
        load: jest.fn((path, onLoad) => onLoad(mockGLTF)),
      };

      require('three').GLTFLoader.mockImplementation(() => mockLoader);
      await modelManager.loadModel(mockModelConfig);

      const models = modelManager.getAllModels();
      expect(models).toHaveLength(1);
      expect(models[0].id).toBe('test-model');
    });

    it('should return empty array when no models loaded', () => {
      const models = modelManager.getAllModels();
      expect(models).toEqual([]);
    });
  });
}); 