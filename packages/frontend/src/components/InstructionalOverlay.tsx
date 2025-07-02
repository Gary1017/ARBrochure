import styled from 'styled-components';
import { TrackingState } from '@shared';

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
`;

const InstructionBox = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  max-width: 300px;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: auto;
`;

const InstructionText = styled.p`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 300;
`;

const StatusIndicator = styled.div<{ $status: TrackingState }>`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'tracking': return '#4CAF50';
      case 'lost': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  }};
  box-shadow: 0 0 10px ${props => {
    switch (props.$status) {
      case 'tracking': return 'rgba(76, 175, 80, 0.5)';
      case 'lost': return 'rgba(255, 152, 0, 0.5)';
      case 'error': return 'rgba(244, 67, 54, 0.5)';
      default: return 'rgba(158, 158, 158, 0.5)';
    }
  }};
`;

interface InstructionalOverlayProps {
  trackingState: TrackingState;
}

const InstructionalOverlay: React.FC<InstructionalOverlayProps> = ({ trackingState }) => {
  const getInstructionText = () => {
    switch (trackingState) {
      case 'initializing':
        return 'Point your camera at the brochure to start...';
      case 'tracking':
        return 'Great! Tap on the 3D models to interact with them.';
      case 'lost':
        return 'Lost tracking. Please point your camera back at the brochure.';
      case 'error':
        return 'Camera access error. Please refresh and try again.';
      default:
        return 'Point your camera at the brochure to start...';
    }
  };

  return (
    <OverlayContainer>
      <StatusIndicator $status={trackingState} />
      <InstructionBox $visible={trackingState !== 'tracking'}>
        <InstructionText>{getInstructionText()}</InstructionText>
      </InstructionBox>
    </OverlayContainer>
  );
};

export default InstructionalOverlay; 