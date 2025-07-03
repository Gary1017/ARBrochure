declare global {
  interface Window {
    MindARThree: typeof MindARThree;
    AFRAME: any;
  }
}

declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  import { Group, Scene, Camera, WebGLRenderer } from 'three';

  export interface MindARThreeConfig {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack?: number;
    uiLoading?: string;
    uiScanning?: string;
    uiError?: string;
    
    // Tracking stability parameters (defaults from MindAR source)
    /** 
     * Minimum confidence filter threshold for tracking stability
     * Lower values = more tolerant tracking (less sensitive to jitter)
     * Default: 0.001 (1e-3)
     */
    filterMinCF?: number | null;
    
    /** 
     * Filter beta parameter for pose smoothing 
     * Lower values = more smoothing, higher values = more responsive
     * Default: 1000 (1e3)
     */
    filterBeta?: number | null;
    
    /** 
     * Number of frames required before showing tracking (stability buffer)
     * Higher values = more stable but slower initial tracking
     * Default: 5 frames
     */
    warmupTolerance?: number | null;
    
    /** 
     * Number of frames tolerance before losing tracking
     * Higher values = more tolerant to temporary tracking loss
     * Default: 5 frames
     */
    missTolerance?: number | null;
  }

  export interface Anchor {
    group: Group;
    onTargetFound: (() => void) | null;
    onTargetLost: (() => void) | null;
  }

  export class MindARThree {
    constructor(config: MindARThreeConfig);
    start(): Promise<void>;
    stop(): void;
    addAnchor(anchorIndex: number): Anchor;
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
  }
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