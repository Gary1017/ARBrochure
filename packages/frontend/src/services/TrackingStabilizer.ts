import * as THREE from 'three';

export interface TrackingStabilityConfig {
  smoothingFactor: number;        // 0-1, higher = more smoothing
  jitterThreshold: number;        // Minimum movement before considering it intentional (pixels)
  stabilityMode: 'responsive' | 'stable' | 'ultra-stable';
  adaptiveSmoothing: boolean;     // Adjust smoothing based on movement patterns
}

export interface PoseData {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  timestamp: number;
}

export class TrackingStabilizer {
  private config: TrackingStabilityConfig;
  private positionHistory: PoseData[] = [];
  private maxHistoryLength = 10;
  private lastStablePosition: THREE.Vector3 | null = null;
  private lastStableRotation: THREE.Quaternion | null = null;
  private movementVelocity = 0;
  
  constructor(config: Partial<TrackingStabilityConfig> = {}) {
    this.config = {
      smoothingFactor: 0.3,
      jitterThreshold: 2.0,
      stabilityMode: 'stable',
      adaptiveSmoothing: true,
      ...config
    };
    
    // Apply stability mode defaults only if smoothingFactor wasn't explicitly set
    if (!config.hasOwnProperty('smoothingFactor')) {
      this.applyStabilityMode();
    }
  }
  
  private applyStabilityMode(): void {
    switch (this.config.stabilityMode) {
      case 'responsive':
        this.config.smoothingFactor = 0.1;
        this.config.jitterThreshold = 1.0;
        break;
      case 'stable':
        this.config.smoothingFactor = 0.3;
        this.config.jitterThreshold = 2.0;
        break;
      case 'ultra-stable':
        this.config.smoothingFactor = 0.6;
        this.config.jitterThreshold = 4.0;
        break;
    }
  }
  
  /**
   * Process and smooth a pose matrix from MindAR tracking
   * @param worldMatrix The transformation matrix from MindAR
   * @returns Smoothed transformation matrix
   */
  public smoothPose(worldMatrix: THREE.Matrix4): THREE.Matrix4 {
    const currentPose = this.extractPoseFromMatrix(worldMatrix);
    
    if (!this.lastStablePosition || !this.lastStableRotation) {
      // First frame, initialize stable pose
      this.lastStablePosition = currentPose.position.clone();
      this.lastStableRotation = currentPose.rotation.clone();
      this.addToHistory(currentPose);
      return worldMatrix;
    }
    
    const movement = this.calculateMovement(currentPose);
    this.updateMovementVelocity(movement);
    
    const isIntentionalMovement = this.detectIntentionalMovement(movement);
    const adaptiveSmoothingFactor = this.calculateAdaptiveSmoothingFactor(movement);
    
    let smoothedPose: PoseData;
    
    if (isIntentionalMovement) {
      // Intentional movement detected, reduce smoothing
      smoothedPose = this.applySmoothingToMovement(currentPose, adaptiveSmoothingFactor * 0.5);
    } else {
      // Likely jitter, apply full smoothing
      smoothedPose = this.applySmoothingToMovement(currentPose, adaptiveSmoothingFactor);
    }
    
    this.lastStablePosition = smoothedPose.position.clone();
    this.lastStableRotation = smoothedPose.rotation.clone();
    this.addToHistory(currentPose);
    
    return this.createMatrixFromPose(smoothedPose);
  }
  
  private extractPoseFromMatrix(matrix: THREE.Matrix4): PoseData {
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    
    matrix.decompose(position, rotation, scale);
    
    return {
      position,
      rotation,
      timestamp: performance.now()
    };
  }
  
  private calculateMovement(currentPose: PoseData): number {
    if (!this.lastStablePosition) return 0;
    
    const positionDelta = currentPose.position.distanceTo(this.lastStablePosition);
    const rotationDelta = Math.abs(1 - Math.abs(currentPose.rotation.dot(this.lastStableRotation!)));
    
    // Combine position and rotation movement into a single metric
    return positionDelta * 100 + rotationDelta * 50; // Scale to pixel-like units
  }
  
  private updateMovementVelocity(movement: number): void {
    // Exponential moving average of movement
    this.movementVelocity = this.movementVelocity * 0.8 + movement * 0.2;
  }
  
  private detectIntentionalMovement(movement: number): boolean {
    // Consider movement intentional if it exceeds threshold and shows acceleration
    const exceedsThreshold = movement > this.config.jitterThreshold;
    const showsAcceleration = movement > this.movementVelocity * 1.2;
    
    return exceedsThreshold && (showsAcceleration || movement > this.config.jitterThreshold * 2);
  }
  
  private calculateAdaptiveSmoothingFactor(movement: number): number {
    if (!this.config.adaptiveSmoothing) {
      return this.config.smoothingFactor;
    }
    
    // Reduce smoothing factor when movement is detected
    const movementRatio = Math.min(movement / (this.config.jitterThreshold * 3), 1);
    return this.config.smoothingFactor * (1 - movementRatio * 0.5);
  }
  
  private applySmoothingToMovement(currentPose: PoseData, smoothingFactor: number): PoseData {
    const smoothedPosition = this.lastStablePosition!.clone().lerp(currentPose.position, 1 - smoothingFactor);
    const smoothedRotation = this.lastStableRotation!.clone().slerp(currentPose.rotation, 1 - smoothingFactor);
    
    return {
      position: smoothedPosition,
      rotation: smoothedRotation,
      timestamp: currentPose.timestamp
    };
  }
  
  private createMatrixFromPose(pose: PoseData): THREE.Matrix4 {
    const matrix = new THREE.Matrix4();
    matrix.compose(pose.position, pose.rotation, new THREE.Vector3(1, 1, 1));
    return matrix;
  }
  
  private addToHistory(pose: PoseData): void {
    this.positionHistory.push(pose);
    if (this.positionHistory.length > this.maxHistoryLength) {
      this.positionHistory.shift();
    }
  }
  
  /**
   * Detect if the tracking is experiencing jitter based on recent history
   */
  public detectJitter(): boolean {
    if (this.positionHistory.length < 3) return false;
    
    const recentPoses = this.positionHistory.slice(-3);
    const movements = [];
    
    for (let i = 1; i < recentPoses.length; i++) {
      const movement = recentPoses[i].position.distanceTo(recentPoses[i - 1].position);
      movements.push(movement);
    }
    
    // Check for rapid back-and-forth movement (jitter pattern)
    const avgMovement = movements.reduce((a, b) => a + b, 0) / movements.length;
    const isSmallMovements = avgMovement < this.config.jitterThreshold / 100; // Very small movements
    const isRapidChanges = movements.every(m => m > 0); // Constant small movements
    
    return isSmallMovements && isRapidChanges && this.movementVelocity > this.config.jitterThreshold * 0.5;
  }
  
  /**
   * Reset the stabilizer state (useful when tracking is lost and reacquired)
   */
  public reset(): void {
    this.positionHistory = [];
    this.lastStablePosition = null;
    this.lastStableRotation = null;
    this.movementVelocity = 0;
  }
  
  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<TrackingStabilityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.applyStabilityMode();
  }
  
  /**
   * Get current stability metrics for debugging/analytics
   */
  public getStabilityMetrics() {
    return {
      movementVelocity: this.movementVelocity,
      historyLength: this.positionHistory.length,
      isJittering: this.detectJitter(),
      currentSmoothingFactor: this.config.smoothingFactor
    };
  }
} 