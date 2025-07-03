/// <reference path="../types/mindar.d.ts" />
import React, { useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import {
  type TrackingState,
  type ModelConfig,
} from '@shared';
import {
  type MindARThreeInstance,
} from '../types/mindar';
import { AnalyticsService } from '../services/AnalyticsService';
import { TrackingStabilizer, type TrackingStabilityConfig } from '../services/TrackingStabilizer';

const SceneContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
`;

interface ARSceneProps {
  onTrackingStateChange?: (state: TrackingState) => void;
  stabilityMode?: 'responsive' | 'stable' | 'ultra-stable';
  onTrackingStart?: () => void;
  onTrackingLost?: () => void;
  onMetricsUpdate?: (metrics: any) => void;
}

const ARScene: React.FC<ARSceneProps> = ({ 
  onTrackingStateChange, 
  stabilityMode = 'ultra-stable',
  onTrackingStart,
  onTrackingLost,
  onMetricsUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindARRef = useRef<MindARThreeInstance | null>(null);
  const analyticsServiceRef = useRef<AnalyticsService | null>(null);
  const trackingStabilizerRef = useRef<TrackingStabilizer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const arStartedRef = useRef(false);
  const cubeRef = useRef<THREE.Mesh | null>(null);

  const isProduction = process.env.NODE_ENV === 'production';
  const analyticsEndpoint = isProduction ? 'http://localhost:3001' : '';

  const loadInitialModels = useCallback(
    async (anchorGroup: THREE.Group) => {
      // Remove previous cube if exists
      if (cubeRef.current) {
        anchorGroup.remove(cubeRef.current);
        if ((cubeRef.current as any).geometry) (cubeRef.current as any).geometry.dispose?.();
        if ((cubeRef.current as any).material) (cubeRef.current as any).material.dispose?.();
        cubeRef.current = null;
      }
      // Remove all other children (defensive)
      while (anchorGroup.children.length > 0) {
        const child = anchorGroup.children[0];
        anchorGroup.remove(child);
        if ((child as any).geometry) (child as any).geometry.dispose?.();
        if ((child as any).material) (child as any).material.dispose?.();
      }
      // Create a simple colored cube
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00,
        metalness: 0.5,
        roughness: 0.5
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0, 0, 0);
      cube.scale.set(0.2, 0.2, 0.2);
      anchorGroup.add(cube);
      cubeRef.current = cube;
      // Debug: print number of children in anchor group
      console.debug('Anchor group children after add:', anchorGroup.children.length);
      // Add a simple animation
      const animate = () => {
        if (arStartedRef.current && cubeRef.current) {
          cubeRef.current.rotation.x += 0.01;
          cubeRef.current.rotation.y += 0.01;
          requestAnimationFrame(animate);
        }
      };
      animate();
      if (analyticsServiceRef.current) {
        analyticsServiceRef.current.trackModelTapped('cube');
      }
    },
    []
  );

  const initializeAR = useCallback(async () => {
    if (!containerRef.current || arStartedRef.current) {
      return;
    }
    onTrackingStateChange?.('initializing');
    analyticsServiceRef.current = (isProduction && analyticsEndpoint)
      ? new AnalyticsService(analyticsEndpoint)
      : null;
    trackingStabilizerRef.current = new TrackingStabilizer({
      stabilityMode: 'ultra-stable',
      smoothingFactor: 0.85,
      jitterThreshold: 8.0,
      adaptiveSmoothing: true
    });
    try {
      const mindARInstance = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: '/assets/mindar/examples/card.mind',
        uiScanning: "no",
        uiLoading: "no",
        filterMinCF: 0.001,
        filterBeta: 0.05,
        warmupTolerance: 12,
        missTolerance: 20,
      });
      mindARRef.current = mindARInstance;

      const { renderer, scene, camera } = mindARInstance;
      
      // Use outputColorSpace instead of outputEncoding
      // This fixes the THREE.WebGLRenderer warning
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      
      // Ensure the renderer size matches the container
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        renderer.setSize(clientWidth, clientHeight);
      }

      // Add proper lighting for better texture visibility
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);

      const anchor = mindARInstance.addAnchor(0);
      
      // Enhanced tracking event handlers with stabilization
      anchor.onTargetFound = () => {
        console.debug('onTargetFound fired');
        onTrackingStateChange?.('tracking');
        onTrackingStart?.();
        if (trackingStabilizerRef.current) {
          const metrics = trackingStabilizerRef.current.getStabilityMetrics();
          onMetricsUpdate?.(metrics);
        }
        // Load a cube when target is found
        loadInitialModels(anchor.group);
        if (analyticsServiceRef.current) {
          analyticsServiceRef.current.trackTrackingStarted();
        }
      };
      
      anchor.onTargetLost = () => {
        console.debug('onTargetLost fired');
        onTrackingStateChange?.('lost');
        onTrackingLost?.();
        if (analyticsServiceRef.current) {
          analyticsServiceRef.current.trackTrackingLost();
        }
        // Destroy the cube when target is lost
        if (cubeRef.current && anchor.group) {
          anchor.group.remove(cubeRef.current);
          if ((cubeRef.current as any).geometry) (cubeRef.current as any).geometry.dispose?.();
          if ((cubeRef.current as any).material) (cubeRef.current as any).material.dispose?.();
          cubeRef.current = null;
        }
        if (trackingStabilizerRef.current) {
          trackingStabilizerRef.current.reset();
        }
      };

      await loadInitialModels(anchor.group);

      await mindARInstance.start();
      arStartedRef.current = true;

      const renderLoop = () => {
        if (arStartedRef.current) {
          renderer.render(scene, camera);
          animationFrameRef.current = requestAnimationFrame(renderLoop);
        }
      };
      renderLoop();
    } catch (error) {
      console.error('Failed to initialize AR:', error);
      onTrackingStateChange?.('error');
      
      // Track initialization errors
      analyticsServiceRef.current?.trackEvent('ar_initialization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stabilityMode
      });
    }
  }, [onTrackingStateChange, loadInitialModels, stabilityMode]);

  const cleanup = useCallback(() => {
    if (arStartedRef.current && mindARRef.current) {
      mindARRef.current.stop();
      arStartedRef.current = false;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (trackingStabilizerRef.current) {
      trackingStabilizerRef.current.reset();
    }
  }, []);

  // Handle stability mode changes
  useEffect(() => {
    if (trackingStabilizerRef.current) {
      trackingStabilizerRef.current.updateConfig({ stabilityMode });
    }
  }, [stabilityMode]);

  useEffect(() => {
    initializeAR();
    return () => cleanup();
  }, [initializeAR, cleanup]);

  return (
    <SceneContainer ref={containerRef} />
  );
};

export default ARScene; 
