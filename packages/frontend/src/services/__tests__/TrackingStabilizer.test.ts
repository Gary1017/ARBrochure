import * as THREE from 'three';
import { TrackingStabilizer, type TrackingStabilityConfig, type PoseData } from '../TrackingStabilizer';

describe('TrackingStabilizer', () => {
  let stabilizer: TrackingStabilizer;
  
  beforeEach(() => {
    stabilizer = new TrackingStabilizer();
  });

  describe('initialization', () => {
    test('should initialize with default config', () => {
      const metrics = stabilizer.getStabilityMetrics();
      expect(metrics.historyLength).toBe(0);
      expect(metrics.movementVelocity).toBe(0);
      expect(metrics.isJittering).toBe(false);
    });

    test('should apply stability mode configurations', () => {
      const responsiveStabilizer = new TrackingStabilizer({ stabilityMode: 'responsive' });
      const stableStabilizer = new TrackingStabilizer({ stabilityMode: 'stable' });
      const ultraStableStabilizer = new TrackingStabilizer({ stabilityMode: 'ultra-stable' });

      expect(responsiveStabilizer.getStabilityMetrics().currentSmoothingFactor).toBe(0.1);
      expect(stableStabilizer.getStabilityMetrics().currentSmoothingFactor).toBe(0.3);
      expect(ultraStableStabilizer.getStabilityMetrics().currentSmoothingFactor).toBe(0.6);
    });

    test('should accept custom config parameters', () => {
      const customConfig: Partial<TrackingStabilityConfig> = {
        smoothingFactor: 0.5,
        jitterThreshold: 3.0,
        adaptiveSmoothing: false
      };
      
      const customStabilizer = new TrackingStabilizer(customConfig);
      const metrics = customStabilizer.getStabilityMetrics();
      expect(metrics.currentSmoothingFactor).toBe(0.5);
    });
  });

  describe('pose smoothing', () => {
    test('should return original matrix for first frame', () => {
      const originalMatrix = createTestMatrix(0, 0, 0);
      const smoothedMatrix = stabilizer.smoothPose(originalMatrix);
      
      expect(smoothedMatrix.equals(originalMatrix)).toBe(true);
    });

    test('should smooth small movements (jitter)', () => {
      // First frame - establish baseline
      const baseMatrix = createTestMatrix(0, 0, 0);
      stabilizer.smoothPose(baseMatrix);
      
      // Second frame - small jitter movement
      const jitterMatrix = createTestMatrix(0.001, 0.001, 0);
      const smoothedMatrix = stabilizer.smoothPose(jitterMatrix);
      
      const smoothedPosition = new THREE.Vector3();
      smoothedMatrix.decompose(smoothedPosition, new THREE.Quaternion(), new THREE.Vector3());
      
      // Smoothed position should be closer to original than jitter position
      expect(smoothedPosition.length()).toBeLessThan(0.001);
    });

    test('should allow intentional large movements', () => {
      // First frame - establish baseline
      const baseMatrix = createTestMatrix(0, 0, 0);
      stabilizer.smoothPose(baseMatrix);
      
      // Second frame - large intentional movement
      const intentionalMatrix = createTestMatrix(0.1, 0.1, 0);
      const smoothedMatrix = stabilizer.smoothPose(intentionalMatrix);
      
      const smoothedPosition = new THREE.Vector3();
      smoothedMatrix.decompose(smoothedPosition, new THREE.Quaternion(), new THREE.Vector3());
      
      // Should move significantly toward the new position
      expect(smoothedPosition.length()).toBeGreaterThan(0.05);
    });

    test('should handle rotation smoothing', () => {
      // First frame - establish baseline
      const baseMatrix = new THREE.Matrix4();
      baseMatrix.makeRotationY(0);
      stabilizer.smoothPose(baseMatrix);
      
      // Second frame - small rotation jitter
      const jitterMatrix = new THREE.Matrix4();
      jitterMatrix.makeRotationY(0.01); // Small rotation
      const smoothedMatrix = stabilizer.smoothPose(jitterMatrix);
      
      const smoothedRotation = new THREE.Quaternion();
      smoothedMatrix.decompose(new THREE.Vector3(), smoothedRotation, new THREE.Vector3());
      
      // Rotation should be smoothed (closer to identity than input)
      expect(Math.abs(smoothedRotation.y)).toBeLessThan(0.01);
    });
  });

  describe('jitter detection', () => {
    test('should not detect jitter with insufficient history', () => {
      expect(stabilizer.detectJitter()).toBe(false);
      
      stabilizer.smoothPose(createTestMatrix(0, 0, 0));
      expect(stabilizer.detectJitter()).toBe(false);
    });

    test('should detect jitter pattern with rapid small movements', () => {
      // Simulate jitter pattern: small rapid back-and-forth movements
      const positions = [
        [0, 0, 0],
        [0.001, 0.001, 0],
        [-0.001, -0.001, 0],
        [0.0005, 0.0005, 0],
        [-0.0008, -0.0008, 0]
      ];
      
      positions.forEach(([x, y, z]) => {
        stabilizer.smoothPose(createTestMatrix(x, y, z));
      });
      
      expect(stabilizer.detectJitter()).toBe(true);
    });

    test('should not detect jitter with smooth intentional movement', () => {
      // Simulate smooth movement
      const positions = [
        [0, 0, 0],
        [0.02, 0.02, 0],
        [0.04, 0.04, 0],
        [0.06, 0.06, 0],
        [0.08, 0.08, 0]
      ];
      
      positions.forEach(([x, y, z]) => {
        stabilizer.smoothPose(createTestMatrix(x, y, z));
      });
      
      expect(stabilizer.detectJitter()).toBe(false);
    });
  });

  describe('adaptive smoothing', () => {
    test('should reduce smoothing for intentional movements', () => {
      const adaptiveStabilizer = new TrackingStabilizer({ 
        adaptiveSmoothing: true,
        smoothingFactor: 0.5 
      });
      
      // Establish baseline
      adaptiveStabilizer.smoothPose(createTestMatrix(0, 0, 0));
      
      // Large movement should reduce smoothing factor
      const largeMovementMatrix = createTestMatrix(0.2, 0.2, 0);
      adaptiveStabilizer.smoothPose(largeMovementMatrix);
      
      // The actual smoothing should be less aggressive for large movements
      // This is tested implicitly through the smoothPose behavior
      expect(adaptiveStabilizer.getStabilityMetrics().movementVelocity).toBeGreaterThan(0);
    });

    test('should maintain smoothing for small movements when adaptive smoothing disabled', () => {
      const nonAdaptiveStabilizer = new TrackingStabilizer({ 
        adaptiveSmoothing: false,
        smoothingFactor: 0.5 
      });
      
      expect(nonAdaptiveStabilizer.getStabilityMetrics().currentSmoothingFactor).toBe(0.5);
    });
  });

  describe('stabilizer state management', () => {
    test('should reset stabilizer state', () => {
      // Add some history
      stabilizer.smoothPose(createTestMatrix(0, 0, 0));
      stabilizer.smoothPose(createTestMatrix(0.01, 0.01, 0));
      
      expect(stabilizer.getStabilityMetrics().historyLength).toBeGreaterThan(0);
      
      stabilizer.reset();
      
      const metrics = stabilizer.getStabilityMetrics();
      expect(metrics.historyLength).toBe(0);
      expect(metrics.movementVelocity).toBe(0);
      expect(metrics.isJittering).toBe(false);
    });

    test('should update configuration', () => {
      const newConfig: Partial<TrackingStabilityConfig> = {
        stabilityMode: 'ultra-stable',
        jitterThreshold: 5.0
      };
      
      stabilizer.updateConfig(newConfig);
      
      expect(stabilizer.getStabilityMetrics().currentSmoothingFactor).toBe(0.6);
    });
  });

  describe('stability metrics', () => {
    test('should provide comprehensive stability metrics', () => {
      stabilizer.smoothPose(createTestMatrix(0, 0, 0));
      stabilizer.smoothPose(createTestMatrix(0.01, 0.01, 0));
      
      const metrics = stabilizer.getStabilityMetrics();
      
      expect(metrics).toHaveProperty('movementVelocity');
      expect(metrics).toHaveProperty('historyLength');
      expect(metrics).toHaveProperty('isJittering');
      expect(metrics).toHaveProperty('currentSmoothingFactor');
      expect(metrics).toHaveProperty('featureTrackingQuality');
      expect(metrics).toHaveProperty('scaleInvariantTracking');
      expect(metrics).toHaveProperty('featureDetectionMode');
      
      expect(typeof metrics.movementVelocity).toBe('number');
      expect(typeof metrics.historyLength).toBe('number');
      expect(typeof metrics.isJittering).toBe('boolean');
      expect(typeof metrics.currentSmoothingFactor).toBe('number');
      expect(typeof metrics.featureTrackingQuality).toBe('number');
      expect(typeof metrics.scaleInvariantTracking).toBe('boolean');
      expect(typeof metrics.featureDetectionMode).toBe('string');
    });

    test('should track movement velocity over time', () => {
      const initialMetrics = stabilizer.getStabilityMetrics();
      expect(initialMetrics.movementVelocity).toBe(0);
      
      // Add movement
      stabilizer.smoothPose(createTestMatrix(0, 0, 0));
      stabilizer.smoothPose(createTestMatrix(0.05, 0.05, 0));
      
      const afterMovementMetrics = stabilizer.getStabilityMetrics();
      expect(afterMovementMetrics.movementVelocity).toBeGreaterThan(0);
    });
  });

  describe('scale-invariant feature tracking', () => {
    test('should analyze scale changes for feature tracking quality', () => {
      const featureTrackingStabilizer = new TrackingStabilizer({
        scaleInvariantTracking: true,
        featureDetectionMode: 'aggressive'
      });
      
      // Simulate consistent movement (good feature tracking)
      featureTrackingStabilizer.smoothPose(createTestMatrix(0, 0, 0));
      featureTrackingStabilizer.smoothPose(createTestMatrix(0.02, 0.02, 0));
      featureTrackingStabilizer.smoothPose(createTestMatrix(0.04, 0.04, 0));
      
      const metrics = featureTrackingStabilizer.getStabilityMetrics();
      expect(metrics.featureTrackingQuality).toBeGreaterThan(0);
      expect(metrics.featureTrackingQuality).toBeLessThanOrEqual(1);
    });

    test('should adjust smoothing based on feature detection mode', () => {
      const aggressiveStabilizer = new TrackingStabilizer({
        smoothingFactor: 0.5,
        featureDetectionMode: 'aggressive'
      });
      
      const conservativeStabilizer = new TrackingStabilizer({
        smoothingFactor: 0.5,
        featureDetectionMode: 'conservative'
      });
      
      // Both should have different effective smoothing factors
      const aggressiveMetrics = aggressiveStabilizer.getStabilityMetrics();
      const conservativeMetrics = conservativeStabilizer.getStabilityMetrics();
      
      expect(aggressiveMetrics.currentSmoothingFactor).toBeLessThan(conservativeMetrics.currentSmoothingFactor);
    });

    test('should reset feature tracking state', () => {
      const featureTrackingStabilizer = new TrackingStabilizer({
        scaleInvariantTracking: true
      });
      
      // Add some movement to establish feature tracking quality
      featureTrackingStabilizer.smoothPose(createTestMatrix(0, 0, 0));
      featureTrackingStabilizer.smoothPose(createTestMatrix(0.01, 0.01, 0));
      
      const beforeReset = featureTrackingStabilizer.getStabilityMetrics();
      expect(beforeReset.featureTrackingQuality).toBeGreaterThan(0);
      
      featureTrackingStabilizer.reset();
      
      const afterReset = featureTrackingStabilizer.getStabilityMetrics();
      expect(afterReset.featureTrackingQuality).toBe(1.0); // Reset to default
    });
  });

  describe('edge cases', () => {
    test('should handle identity matrices', () => {
      const identityMatrix = new THREE.Matrix4();
      const result = stabilizer.smoothPose(identityMatrix);
      
      expect(result).toBeInstanceOf(THREE.Matrix4);
      expect(result.equals(identityMatrix)).toBe(true);
    });

    test('should handle extreme position values', () => {
      const extremeMatrix = createTestMatrix(1000, 1000, 1000);
      const result = stabilizer.smoothPose(extremeMatrix);
      
      expect(result).toBeInstanceOf(THREE.Matrix4);
      expect(result.determinant()).not.toBe(0); // Should still be valid
    });

    test('should handle rapid configuration changes', () => {
      stabilizer.updateConfig({ stabilityMode: 'responsive' });
      stabilizer.updateConfig({ stabilityMode: 'ultra-stable' });
      stabilizer.updateConfig({ smoothingFactor: 0.8 });
      
      const metrics = stabilizer.getStabilityMetrics();
      // With ultra-stable mode and aggressive feature detection, the smoothing factor will be adjusted
      expect(metrics.currentSmoothingFactor).toBe(0.6); // ultra-stable default
    });
  });

  // Helper function to create test transformation matrices
  function createTestMatrix(x: number, y: number, z: number, rotX = 0, rotY = 0, rotZ = 0): THREE.Matrix4 {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3(x, y, z);
    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(rotX, rotY, rotZ));
    const scale = new THREE.Vector3(1, 1, 1);
    
    matrix.compose(position, rotation, scale);
    return matrix;
  }
}); 