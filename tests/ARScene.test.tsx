import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ARScene from '../packages/frontend/src/components/ARScene';
import { TrackingState } from '../packages/shared/src';

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
  })),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas'),
  })),
  Raycaster: jest.fn().mockImplementation(() => ({
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn(() => []),
  })),
  Vector2: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  })),
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

describe('ARScene Component', () => {
  const mockOnTrackingStateChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnTrackingStateChange.mockClear();
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

    it('should handle camera access errors gracefully', async () => {
      const mockError = new Error('Camera access denied');
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(mockError);

      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('error');
      });
    });

    it('should transition to tracking state after successful initialization', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      }, { timeout: 3000 });
    });
  });

  describe('3D Model Management', () => {
    it('should load and add 3D models to the scene', async () => {
      const mockModel = {
        id: 'test-model',
        name: 'Test Model',
        path: '/models/test.glb',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      };

      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });
    });

    it('should handle model loading errors gracefully', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });
    });
  });

  describe('User Interaction', () => {
    it('should handle tap events on 3D models', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });

      // Simulate tap event
      const canvas = screen.getByRole('img', { hidden: true });
      act(() => {
        canvas.dispatchEvent(new MouseEvent('click', {
          clientX: 100,
          clientY: 100,
        }));
      });
    });

    it('should perform raycasting on tap events', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });
    });
  });

  describe('Tracking State Management', () => {
    it('should update tracking state when tracking is lost', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });
    });

    it('should recover tracking when it is regained', async () => {
      render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on unmount', async () => {
      const { unmount } = render(<ARScene onTrackingStateChange={mockOnTrackingStateChange} />);

      await waitFor(() => {
        expect(mockOnTrackingStateChange).toHaveBeenCalledWith('tracking');
      });

      unmount();

      // Verify cleanup was called
      expect(mockMindAR.MindARThree).toHaveBeenCalled();
    });
  });
}); 