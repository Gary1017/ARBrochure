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
  onTrackingStateChange: (state: TrackingState) => void;
}

const ARScene: React.FC<ARSceneProps> = ({ onTrackingStateChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindARRef = useRef<MindARThreeInstance | null>(null);
  const analyticsServiceRef = useRef<AnalyticsService | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const arStartedRef = useRef(false);

  const loadInitialModels = useCallback(
    async (anchorGroup: THREE.Group) => {
      if (!analyticsServiceRef.current) return;

      // Create a simple colored cube instead of loading GLTF
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00,
        metalness: 0.5,
        roughness: 0.5
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0, 0, 0);
      cube.scale.set(0.2, 0.2, 0.2);
      
      // Add the cube to the anchor group
      anchorGroup.add(cube);
      
      // Add a simple animation
      const animate = () => {
        if (arStartedRef.current) {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
          requestAnimationFrame(animate);
        }
      };
      animate();
      
      analyticsServiceRef.current?.trackModelTapped('cube');
    },
    []
  );

  const initializeAR = useCallback(async () => {
    if (!containerRef.current || arStartedRef.current) {
      return;
    }

    onTrackingStateChange('initializing');
    analyticsServiceRef.current = new AnalyticsService('http://localhost:3001');

    try {
      const mindARInstance = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: '/assets/mindar/examples/card.mind',
        uiScanning: "no", // Disable default UI
        uiLoading: "no",  // Disable default UI
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
      anchor.onTargetFound = () => {
        onTrackingStateChange('tracking');
        analyticsServiceRef.current?.trackTrackingStarted();
      };
      anchor.onTargetLost = () => {
        onTrackingStateChange('lost');
        analyticsServiceRef.current?.trackTrackingLost();
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
      onTrackingStateChange('error');
    }
  }, [onTrackingStateChange, loadInitialModels]);

  const cleanup = useCallback(() => {
    if (arStartedRef.current && mindARRef.current) {
      mindARRef.current.stop();
      arStartedRef.current = false;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    initializeAR();
    return () => cleanup();
  }, [initializeAR, cleanup]);

  return (
    <SceneContainer ref={containerRef} />
  );
};

export default ARScene; 
