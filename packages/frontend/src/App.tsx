import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrackingState } from '@shared';
import LoadingScreen from './components/LoadingScreen';
import InstructionalOverlay from './components/InstructionalOverlay';
import ARScene from './components/ARScene';
import './App.css';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
`;

const App: React.FC = () => {
  const [trackingState, setTrackingState] = useState<TrackingState>('initializing');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize AR and load assets
    const initializeApp = async () => {
      try {
        // Simulate initialization time
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
        setTrackingState('tracking');
      } catch (error) {
        console.error('Failed to initialize AR:', error);
        setTrackingState('error');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AppContainer>
      <ARScene onTrackingStateChange={setTrackingState} />
      <InstructionalOverlay trackingState={trackingState} />
    </AppContainer>
  );
};

export default App; 