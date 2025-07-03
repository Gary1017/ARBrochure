// AR Event Types
export interface AREvent {
  timestamp: string;
  event_type: 'app_launched' | 'model_tapped' | 'tracking_started' | 'tracking_lost' | 'app_closed' | 'stability_metrics' | 'ar_initialization_error' | string;
  model_id?: string;
  session_id: string;
  user_id: string;
  [key: string]: any; // Allow additional properties for custom events
}

// 3D Model Configuration
export interface ModelConfig {
  id: string;
  name: string;
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  animations?: AnimationConfig[];
}

export interface AnimationConfig {
  name: string;
  type: 'rotation' | 'scale' | 'position' | 'glow';
  duration: number;
  easing: string;
  loop: boolean;
  direction: 'normal' | 'reverse' | 'alternate';
}

// Feishu API Types
export interface FeishuResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface FeishuRecord {
  record_id?: string;
  fields: Record<string, any>;
  created_time?: number;
  last_modified_time?: number;
}

// AR Tracking States
export type TrackingState = 'initializing' | 'tracking' | 'lost' | 'error';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Configuration Types
export interface AppConfig {
  backend_url: string;
  feishu_app_id: string;
  ar_target_image: string;
  models: ModelConfig[];
}

export const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const DEFAULT_TRACKING_TIMEOUT = 5000; // 5 seconds 