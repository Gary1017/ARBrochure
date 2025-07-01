import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { TrackingState } from '@shared';

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
  pointer-events: none;
`;

interface ARSceneProps {
  onTrackingStateChange: (state: TrackingState) => void;
}

const ARScene: React.FC<ARSceneProps> = ({ onTrackingStateChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const initializeAR = async () => {
      try {
        onTrackingStateChange('initializing');

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // Simulate AR tracking (in real implementation, this would use mind-ar-js)
        setTimeout(() => {
          onTrackingStateChange('tracking');
        }, 2000);

      } catch (error) {
        console.error('Failed to initialize AR:', error);
        onTrackingStateChange('error');
      }
    };

    initializeAR();

    // Cleanup
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onTrackingStateChange]);

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
      />
    </SceneContainer>
  );
};

export default ARScene; 