import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ModelConfig } from '@shared';

interface LoadedModel {
  id: string;
  scene: THREE.Group;
  animations: THREE.AnimationMixer[];
  config: ModelConfig;
}

interface AnimationState {
  mixer: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
}

export class ModelManager {
  private scene: THREE.Scene;
  private models: Map<string, LoadedModel> = new Map();
  private animationStates: Map<string, AnimationState> = new Map();
  private tapHandlers: Map<string, (modelId: string) => void> = new Map();

  constructor(scene: THREE.Scene, _camera: THREE.Camera) {
    this.scene = scene;
    // Camera parameter kept for future features but not stored
  }

  async loadModel(config: ModelConfig): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      
      loader.load(
        config.path,
        (gltf) => {
          try {
            const modelGroup = new THREE.Group();
            modelGroup.add(gltf.scene);

            // Position the model according to config
            modelGroup.position.set(
              config.position[0],
              config.position[1],
              config.position[2]
            );
            modelGroup.rotation.set(
              config.rotation[0],
              config.rotation[1],
              config.rotation[2]
            );
            modelGroup.scale.set(
              config.scale[0],
              config.scale[1],
              config.scale[2]
            );

            // Setup animations
            const animationMixers: THREE.AnimationMixer[] = [];
            if (gltf.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(gltf.scene);
              animationMixers.push(mixer);
              
              const animationState: AnimationState = {
                mixer,
                actions: new Map(),
              };

              gltf.animations.forEach((animation) => {
                const action = mixer.clipAction(animation);
                animationState.actions.set(animation.name, action);
              });

              this.animationStates.set(config.id, animationState);
            }

            const loadedModel: LoadedModel = {
              id: config.id,
              scene: modelGroup,
              animations: animationMixers,
              config,
            };

            this.models.set(config.id, loadedModel);
            this.scene.add(modelGroup);

            resolve(loadedModel);
          } catch (error) {
            reject(error);
          }
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }

  playAnimation(modelId: string, animationName: string): void {
    const animationState = this.animationStates.get(modelId);
    if (!animationState) {
      console.warn(`No animations found for model: ${modelId}`);
      return;
    }

    const action = animationState.actions.get(animationName);
    if (!action) {
      console.warn(`Animation "${animationName}" not found for model: ${modelId}`);
      return;
    }

    // Stop all other animations
    animationState.actions.forEach((otherAction) => {
      otherAction.stop();
    });

    // Play the requested animation
    action.play();
  }

  stopAnimation(modelId: string, animationName: string): void {
    const animationState = this.animationStates.get(modelId);
    if (!animationState) {
      return;
    }

    const action = animationState.actions.get(animationName);
    if (action) {
      action.stop();
    }
  }

  setModelTapHandler(modelId: string, handler: (modelId: string) => void): void {
    this.tapHandlers.set(modelId, handler);
  }

  handleTap(modelId: string): void {
    const handler = this.tapHandlers.get(modelId);
    if (handler) {
      handler(modelId);
      this.provideVisualFeedback(modelId);
    }
  }

  private provideVisualFeedback(modelId: string): void {
    const model = this.models.get(modelId);
    if (!model) {
      return;
    }

    // Create a temporary glow effect
    const originalScale = model.scene.scale.clone();
    const targetScale = originalScale.clone().multiplyScalar(1.1);

    // Animate scale up and down
    const tween = new THREE.Vector3();
    const duration = 300; // 300ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease in-out function
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      tween.lerpVectors(originalScale, targetScale, eased);
      model.scene.scale.copy(tween);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animate back to original scale
        const backStartTime = Date.now();
        const backAnimate = () => {
          const backElapsed = Date.now() - backStartTime;
          const backProgress = Math.min(backElapsed / duration, 1);
          const backEased = backProgress < 0.5 
            ? 2 * backProgress * backProgress 
            : 1 - Math.pow(-2 * backProgress + 2, 2) / 2;

          tween.lerpVectors(targetScale, originalScale, backEased);
          model.scene.scale.copy(tween);

          if (backProgress < 1) {
            requestAnimationFrame(backAnimate);
          }
        };
        requestAnimationFrame(backAnimate);
      }
    };

    requestAnimationFrame(animate);
  }

  removeModel(modelId: string): void {
    const model = this.models.get(modelId);
    if (!model) {
      return;
    }

    // Cleanup animations
    const animationState = this.animationStates.get(modelId);
    if (animationState) {
      animationState.mixer.stopAllAction();
      this.animationStates.delete(modelId);
    }

    // Remove from scene
    this.scene.remove(model.scene);
    this.models.delete(modelId);
    this.tapHandlers.delete(modelId);
  }

  update(deltaTime: number): void {
    // Update all animation mixers
    this.animationStates.forEach((animationState) => {
      animationState.mixer.update(deltaTime);
    });
  }

  getModel(modelId: string): LoadedModel | undefined {
    return this.models.get(modelId);
  }

  getAllModels(): LoadedModel[] {
    return Array.from(this.models.values());
  }
} 