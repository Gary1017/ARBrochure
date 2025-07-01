declare global {
  interface Window {
    MindARThree: typeof MindARThree;
    AFRAME: any;
  }
}

export interface MindARThreeConfig {
  container: HTMLElement;
  imageTargetSrc: string;
  maxTrack?: number;
  warmupTolerance?: number;
  missTolerance?: number;
  uiScanning?: string;
  uiLoading?: string;
  uiError?: string;
  filterMinCF?: number;
  filterBeta?: number;
  uiLoading?: string;
  uiScanning?: string;
  uiError?: string;
}

export interface MindARThree {
  new (config: MindARThreeConfig): MindARThreeInstance;
}

export interface MindARThreeInstance {
  start(): Promise<void>;
  stop(): void;
  on(event: string, callback: (event: any) => void): void;
  off(event: string, callback: (event: any) => void): void;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  addAnchor(index: number): MindARAnchor;
  anchors: MindARAnchor[];
}

export interface MindARAnchor {
  group: THREE.Group;
  targetIndex: number;
  onTargetFound(): void;
  onTargetLost(): void;
  onTargetUpdate(): void;
}

export interface MindAREvent {
  targetIndex: number;
  anchor?: MindARAnchor;
}

// A-Frame specific types
export interface MindARImageTarget {
  targetIndex: number;
}

export interface MindARImageSystem {
  start(): Promise<void>;
  stop(): void;
  addTarget(targetIndex: number): void;
  removeTarget(targetIndex: number): void;
}

export interface MindARImageComponent {
  targetIndex: number;
  onTargetFound(): void;
  onTargetLost(): void;
  onTargetUpdate(): void;
} 