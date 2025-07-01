import { useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';
import { TrackingState, ModelConfig } from '@shared';
import { ModelManager } from '../services/ModelManager';
import { AnalyticsService } from '../services/AnalyticsService';
import { MindARThreeInstance, MindARThreeConfig } from '../types/mindar';

const SceneContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CanvasElement = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
`;

interface ARSceneProps {
  onTrackingStateChange: (state: TrackingState) => void;
}

const ARScene: React.FC<ARSceneProps> = ({ onTrackingStateChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mindARRef = useRef<MindARThreeInstance | null>(null);
  const modelManagerRef = useRef<ModelManager | null>(null);
  const analyticsServiceRef = useRef<AnalyticsService | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2 | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const loadMindARScripts = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if MindAR is already loaded
      if (window.MindARThree) {
        resolve();
        return;
      }

      let scriptsLoaded = 0;
      const totalScripts = 2;

      const onScriptLoad = () => {
        scriptsLoaded++;
        if (scriptsLoaded === totalScripts) {
          resolve();
        }
      };

      const onScriptError = () => {
        reject(new Error('Failed to load MindAR script'));
      };

      // Load core image processing script
      const script1 = document.createElement('script');
      script1.src = '/assets/mindar/mindar-image.prod.js';
      script1.onload = onScriptLoad;
      script1.onerror = onScriptError;
      document.head.appendChild(script1);

      // Load Three.js integration script
      const script2 = document.createElement('script');
      script2.src = '/assets/mindar/mindar-image-three.prod.js';
      script2.onload = onScriptLoad;
      script2.onerror = onScriptError;
      document.head.appendChild(script2);
    });
  }, []);

  const initializeAR = useCallback(async () => {
    try {
      onTrackingStateChange('initializing');

      // Load MindAR scripts first
      await loadMindARScripts();

      // Initialize analytics
      analyticsServiceRef.current = new AnalyticsService('http://localhost:3001');

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Initialize Three.js scene
      sceneRef.current = new THREE.Scene();
      cameraRef.current = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      // Initialize renderer
      rendererRef.current = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        alpha: true,
        antialias: true,
      });
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);

      // Initialize raycasting for tap detection
      raycasterRef.current = new THREE.Raycaster();
      mouseRef.current = new THREE.Vector2();

      // Initialize model manager
      modelManagerRef.current = new ModelManager(sceneRef.current, cameraRef.current);

      // Initialize MindAR
      if (window.MindARThree) {
        const mindARConfig: MindARThreeConfig = {
          container: canvasRef.current!,
          imageTargetSrc: '/assets/mindar/examples/card.mind',
          maxTrack: 1,
          warmupTolerance: 5,
          missTolerance: 10,
        };

        mindARRef.current = new window.MindARThree(mindARConfig);

        // Start AR session
        if (mindARRef.current) {
          await mindARRef.current.start();
          
          // Track AR events
          mindARRef.current.on('targetFound', () => {
            onTrackingStateChange('tracking');
            analyticsServiceRef.current?.trackTrackingStarted();
          });

          mindARRef.current.on('targetLost', () => {
            onTrackingStateChange('lost');
            analyticsServiceRef.current?.trackTrackingLost();
          });
        }

        // Load initial models
        await loadInitialModels();

        // Start render loop
        startRenderLoop();
      } else {
        // Fallback: simulate AR tracking
        setTimeout(() => {
          onTrackingStateChange('tracking');
          analyticsServiceRef.current?.trackTrackingStarted();
        }, 2000);
      }

    } catch (error) {
      console.error('Failed to initialize AR:', error);
      onTrackingStateChange('error');
    }
  }, [onTrackingStateChange, loadMindARScripts]);

  const loadInitialModels = async () => {
    if (!modelManagerRef.current || !mindARRef.current) return;

    const defaultModels: ModelConfig[] = [
      {
        id: 'product-1',
        name: 'Product Model 1',
        path: '/assets/mindar/examples/softmind/scene.gltf',
        position: [0, 0, 0.1], // Position relative to target
        rotation: [0, 0, 0],
        scale: [0.005, 0.005, 0.005], // Scale from MindAR example
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
      },
    ];

    try {
      // Create MindAR anchor for target 0
      const anchor = mindARRef.current.addAnchor(0);
      
      // Load models and add them to the anchor group
      for (const modelConfig of defaultModels) {
        const model = await modelManagerRef.current.loadModel(modelConfig);
        
        // Add model to MindAR anchor group
        anchor.group.add(model.scene);
        
        // Set up tap handler
        modelManagerRef.current.setModelTapHandler(model.id, (modelId) => {
          analyticsServiceRef.current?.trackModelTapped(modelId);
          modelManagerRef.current?.playAnimation(modelId, 'idle');
        });
      }

      // Set up anchor event handlers
      anchor.onTargetFound = () => {
        console.log('Target found - showing models');
        onTrackingStateChange('tracking');
        analyticsServiceRef.current?.trackTrackingStarted();
      };

      anchor.onTargetLost = () => {
        console.log('Target lost - hiding models');
        onTrackingStateChange('lost');
        analyticsServiceRef.current?.trackTrackingLost();
      };

    } catch (error) {
      console.error('Failed to load initial models:', error);
    }
  };

  const startRenderLoop = () => {
    const animate = () => {
      if (mindARRef.current) {
        // Use MindAR's built-in renderer, scene, and camera
        const { renderer, scene, camera } = mindARRef.current;
        renderer.render(scene, camera);
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Fallback to our own Three.js setup
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      // Update model animations
      if (modelManagerRef.current) {
        modelManagerRef.current.update(0.016); // 60 FPS
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const handleTap = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!raycasterRef.current || !mouseRef.current || !cameraRef.current || !modelManagerRef.current) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    // Get all models for intersection testing
    const models = modelManagerRef.current.getAllModels();
    const meshes: THREE.Object3D[] = [];
    
    models.forEach(model => {
      model.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshes.push(child);
        }
      });
    });

    const intersects = raycasterRef.current.intersectObjects(meshes);

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object;
      
      // Find the model that contains this mesh
      for (const model of models) {
        let found = false;
        model.scene.traverse((child) => {
          if (child === intersectedMesh) {
            found = true;
          }
        });
        
        if (found) {
          modelManagerRef.current.handleTap(model.id);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    initializeAR();

    // Track app launch
    analyticsServiceRef.current?.trackAppLaunched();

    // Handle window resize
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (cameraRef.current instanceof THREE.PerspectiveCamera) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
        }
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      if (mindARRef.current) {
        mindARRef.current.stop();
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      // Track app close
      analyticsServiceRef.current?.trackAppClosed();
    };
  }, [initializeAR]);

  return (
    <SceneContainer>
      <VideoElement
        ref={videoRef}
        autoPlay
        playsInline
        muted
      />
      <CanvasElement
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleTap}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
          });
          handleTap(mouseEvent as any);
        }}
      />
    </SceneContainer>
  );
};

export default ARScene; 
