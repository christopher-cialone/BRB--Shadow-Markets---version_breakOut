import React, { useState, useEffect } from 'react';
import { WebSocketProvider } from './context/WebSocketContext';
import { GameStateProvider } from './context/GameStateContext';
import NavBar from './components/layout/NavBar';
import Toast from './components/ui/Toast';
import RanchScreen from './components/game/RanchScreen';
import ShadowMarketScreen from './components/game/ShadowMarketScreen';

// Define our main App component
const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<'ranch' | 'shadowMarket' | 'saloon'>('ranch');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Array<{id: string; message: string; type: string}>>([]);

  // Placeholder functions for scene transitions
  const goToRanch = () => setCurrentScene('ranch');
  const goToShadowMarket = () => setCurrentScene('shadowMarket');
  const goToSaloon = () => setCurrentScene('saloon');

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  if (loading) {
    return <div className="loading-screen">
      <div className="loading-title">Loading Bull Run Boost...</div>
      <div className="loading-spinner"></div>
    </div>;
  }

  return (
    <GameStateProvider>
      <WebSocketProvider>
        <div className="app-container">
          <NavBar 
            currentScene={currentScene}
            onRanchClick={goToRanch}
            onShadowMarketClick={goToShadowMarket}
            onSaloonClick={goToSaloon}
          />

          <main className="app-content">
            {currentScene === 'ranch' && <RanchScreen />}
            {currentScene === 'shadowMarket' && <ShadowMarketScreen />}
            {currentScene === 'saloon' && <div>Saloon Scene (Coming Soon)</div>}
          </main>

          <footer className="app-footer">
            <div>Bull Run Boost - Shadow Markets of the Cyber-West</div>
            <div>© 2025 Cyber-Western Games</div>
          </footer>

          {/* Toast container */}
          <div className="toast-container">
            {toasts.map(toast => (
              <Toast 
                key={toast.id}
                message={toast.message}
                type={toast.type as 'success' | 'error' | 'info'}
              />
            ))}
          </div>
        </div>
      </WebSocketProvider>
    </GameStateProvider>
  );
};

export default App;