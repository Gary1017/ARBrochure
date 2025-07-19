import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ARScene from '../ARScene';

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    updateProjectionMatrix: jest.fn(),
    aspect: 1,
  })),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    domElement: document.createElement('canvas'),
  })),
  Raycaster: jest.fn().mockImplementation(() => ({
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn(() => []),
  })),
  Vector2: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  })),
  Group: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    traverse: jest.fn(),
    children: [],
  })),
  Mesh: jest.fn(),
  Object3D: jest.fn(),
}));

// Mock ModelManager
const mockModelManager = {
  loadModel: jest.fn(),
  setModelTapHandler: jest.fn(),
  handleTap: jest.fn(),
  getAllModels: jest.fn(() => []),
  update: jest.fn(),
};

jest.mock('../services/ModelManager', () => ({
  ModelManager: jest.fn().mockImplementation(() => mockModelManager),
}));

// Mock AnalyticsService
const mockAnalyticsService = {
  trackAppLaunched: jest.fn(),
  trackTrackingStarted: jest.fn(),
  trackTrackingLost: jest.fn(),
  trackModelTapped: jest.fn(),
  trackAppClosed: jest.fn(),
};

jest.mock('../services/AnalyticsService', () => ({
  AnalyticsService: jest.fn().mockImplementation(() => mockAnalyticsService),
}));

// Mock MindAR
const mockMindAR = {
  MindARThree: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    addAnchor: jest.fn().mockReturnValue({
      group: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      targetIndex: 0,
      onTargetFound: jest.fn(),
      onTargetLost: jest.fn(),
      onTargetUpdate: jest.fn(),
    }),
    renderer: {
      render: jest.fn(),
      domElement: document.createElement('canvas'),
    },
    scene: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    camera: {
      position: { set: jest.fn() },
    },
    anchors: [],
  })),
};

// Mock global MindAR
Object.defineProperty(window, 'MindARThree', {
  value: mockMindAR.MindARThree,
  writable: true,
});

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn();

// Mock document.createElement for script loading
const mockScript = {
  src: '',
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
};

document.createElement = jest.fn((tagName) => {
  if (tagName === 'script') {
    return mockScript as any;
  }
  return document.createElement(tagName);
});

// Mock document.head.appendChild
document.head.appendChild = jest.fn();

describe('ARScene Component', () => {
  const mockOnTrackingStateChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnTrackingStateChange.mockClear();
    
    // Reset mock script
    mockScript.src = '';
    mockScript.onload = null;
    mockScript.onerror = null;
  });

  describe('Initialization', () => {
    it('should initialize AR scene and request camera access', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      expect(mockOnTrackingStateChange).toHaveBeenCalledWith('initializing');
      
      await waitFor(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
      });
    });

    it('should load MindAR scripts dynamically', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(document.createElement).toHaveBeenCalledWith('script');
        expect(document.head.appendChild).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle MindAR script loading errors', async () => {
      // Mock script error
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'script') {
          const script = { ...mockScript };
          setTimeout(() => script.onerror?.(), 0);
          return script as any;
        }
        return originalCreateElement(tagName);
      });

      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('error');
      });
    });

    it('should handle camera access errors gracefully', async () => {
      const mockError = new Error('Camera access denied');
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(mockError);

      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('error');
      });
    });

    it('should initialize analytics service', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockAnalyticsService.trackAppLaunched).toHaveBeenCalled();
      });
    });

    it('should initialize Three.js scene and renderer', async () => {
      const { Scene, PerspectiveCamera, WebGLRenderer } = require('three');
      
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(Scene).toHaveBeenCalled();
        expect(PerspectiveCamera).toHaveBeenCalled();
        expect(WebGLRenderer).toHaveBeenCalled();
      });
    });
  });

  describe('MindAR Integration', () => {
    it('should initialize MindAR with correct configuration', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockMindAR.MindARThree).toHaveBeenCalledWith({
          container: expect.any(HTMLCanvasElement),
          imageTargetSrc: '/assets/mindar/examples/card.mind',
          maxTrack: 1,
          warmupTolerance: 5,
          missTolerance: 10,
        });
      });
    });

    it('should start MindAR session', async () => {
      const mockMindARInstance = mockMindAR.MindARThree();
      
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockMindARInstance.start).toHaveBeenCalled();
      });
    });

    it('should handle MindAR target found event', async () => {
      const mockMindARInstance = mockMindAR.MindARThree();
      
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockMindARInstance.on).toHaveBeenCalledWith('targetFound', expect.any(Function));
      });

      // Simulate target found
      const targetFoundCallback = mockMindARInstance.on.mock.calls.find(
        (call: any) => call[0] === 'targetFound'
      )?.[1];
      
      if (targetFoundCallback) {
        targetFoundCallback();
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
        expect(mockAnalyticsService.trackTrackingStarted).toHaveBeenCalled();
      }
    });

    it('should handle MindAR target lost event', async () => {
      const mockMindARInstance = mockMindAR.MindARThree();
      
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockMindARInstance.on).toHaveBeenCalledWith('targetLost', expect.any(Function));
      });

      // Simulate target lost
      const targetLostCallback = mockMindARInstance.on.mock.calls.find(
        (call: any) => call[0] === 'targetLost'
      )?.[1];
      
      if (targetLostCallback) {
        targetLostCallback();
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('lost');
        expect(mockAnalyticsService.trackTrackingLost).toHaveBeenCalled();
      }
    });
  });

  describe('3D Model Management', () => {
    it('should load initial models', async () => {
      const mockModel = {
        id: 'product-1',
        scene: { traverse: jest.fn() },
      };
      mockModelManager.loadModel.mockResolvedValue(mockModel);

      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockModelManager.loadModel).toHaveBeenCalledWith({
          id: 'product-1',
          name: 'Product Model 1',
          path: '/assets/mindar/examples/softmind/scene.gltf',
          position: [0, 0, 0.1],
          rotation: [0, 0, 0],
          scale: [0.005, 0.005, 0.005],
          animations: expect.any(Array),
        });
      });
    });

    it('should set up model tap handlers', async () => {
      const mockModel = {
        id: 'product-1',
        scene: { traverse: jest.fn() },
      };
      mockModelManager.loadModel.mockResolvedValue(mockModel);

      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockModelManager.setModelTapHandler).toHaveBeenCalledWith(
          'product-1',
          expect.any(Function)
        );
      });
    });

    it('should handle model loading errors gracefully', async () => {
      mockModelManager.loadModel.mockRejectedValue(new Error('Model loading failed'));

      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      // Should not crash and should continue with initialization
      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });
    });
  });

  describe('User Interaction', () => {
    it('should handle tap events on canvas', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });

      const canvas = screen.getByRole('img', { hidden: true });
      
      act(() => {
        fireEvent.mouseDown(canvas, {
          clientX: 100,
          clientY: 100,
        });
      });

      // Should not crash and should handle the event
      expect(canvas).toBeInTheDocument();
    });

    it('should handle touch events on canvas', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });

      const canvas = screen.getByRole('img', { hidden: true });
      
      act(() => {
        fireEvent.touchStart(canvas, {
          touches: [{ clientX: 100, clientY: 100 }],
        });
      });

      // Should not crash and should handle the event
      expect(canvas).toBeInTheDocument();
    });

    it('should perform raycasting on tap events', async () => {
      const { Raycaster } = require('three');
      
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(Raycaster).toHaveBeenCalled();
      });
    });
  });

  describe('Render Loop', () => {
    it('should start render loop', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(global.requestAnimationFrame).toHaveBeenCalled();
      });
    });

    it('should update model animations in render loop', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockModelManager.update).toHaveBeenCalledWith(0.016);
      });
    });
  });

  describe('Window Resize Handling', () => {
    it('should handle window resize events', async () => {
      const { WebGLRenderer, PerspectiveCamera } = require('three');
      const mockRenderer = WebGLRenderer.mock.results[0].value;
      const mockCamera = PerspectiveCamera.mock.results[0].value;

      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });

      // Simulate window resize
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // Should update camera and renderer
      expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
      expect(mockRenderer.setSize).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on unmount', async () => {
      const mockMindARInstance = mockMindAR.MindARThree();
      const { WebGLRenderer } = require('three');
      const mockRenderer = WebGLRenderer.mock.results[0].value;

      const { unmount } = render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });

      unmount();

      expect(global.cancelAnimationFrame).toHaveBeenCalled();
      expect(mockMindARInstance.stop).toHaveBeenCalled();
      expect(mockRenderer.dispose).toHaveBeenCalled();
      expect(mockAnalyticsService.trackAppClosed).toHaveBeenCalled();
    });

    it('should stop camera stream on unmount', async () => {
      const mockStream = {
        getTracks: () => [{ stop: jest.fn() }],
      };
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream);

      const { unmount } = render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });

      unmount();

      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
    });

    it('should remove event listeners on unmount', async () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Fallback Behavior', () => {
    it('should fallback to simulation when MindAR is not available', async () => {
      // Remove MindAR from window
      delete (window as any).MindARThree;

      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      }, { timeout: 3000 });
    });
  });

  describe('Camera Visibility', () => {
    it('should render the scene container properly', async () => {
      const { container } = render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);
      
      // Check that the container is rendered and not hidden
      const sceneContainer = container.firstChild;
      expect(sceneContainer).toBeInTheDocument();
      expect(sceneContainer).toHaveStyle(`
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      `);
      
      // Verify MindAR is initialized with the container
      await waitFor(() => {
        expect(mockMindAR.MindARThree).toHaveBeenCalledWith(
          expect.objectContaining({
            container: expect.any(HTMLDivElement),
            uiScanning: "no",
            uiLoading: "no"
          })
        );
      });
    });
  });
});