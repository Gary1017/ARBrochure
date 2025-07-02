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
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  background: #000;
  z-index: 1;
`;

const App: React.FC = () => {
  const [trackingState, setTrackingState] = useState<TrackingState>('initializing');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app with shorter loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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