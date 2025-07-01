import styled from 'styled-components';

const LoadingContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.h2`
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0;
  text-align: center;
`;

const SubText = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 10px 0 0 0;
  text-align: center;
`;

const LoadingScreen: React.FC = () => {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>Initializing AR Experience</LoadingText>
      <SubText>Please wait while we set up your camera...</SubText>
    </LoadingContainer>
  );
};

export default LoadingScreen; 