import { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import ARTestPage from './components/ARTestPage';
import './App.css';

const App: React.FC = () => {
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

  return <ARTestPage />;
};

export default App; 