import React, { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import RanchScreen from './components/game/RanchScreen';
import ShadowMarketScreen from './components/game/ShadowMarketScreen';
import NavBar from './components/layout/NavBar';
import FullScreenLoader from './components/ui/FullScreenLoader';
import { ToastContainer } from './components/ui/Toast';

const App: React.FC = () => {
  const { gameState } = useGameState();
  const [currentScreen, setCurrentScreen] = useState<'main' | 'ranch' | 'shadowMarket' | 'saloon'>('main');

  // Function to navigate between screens
  const navigateTo = (screen: 'main' | 'ranch' | 'shadowMarket' | 'saloon') => {
    setCurrentScreen(screen);
  };

  return (
    <div className="app">
      <ToastContainer />
      <NavBar currentScreen={currentScreen} onNavigate={navigateTo} />
      
      {gameState.loading && <FullScreenLoader />}
      
      <main className="main-content">
        {currentScreen === 'main' && (
          <div className="welcome-screen">
            <h1 className="text-neon-pink text-4xl mb-6 text-center">
              Bull Run Boost - Shadow Markets
            </h1>
            <p className="text-center text-cyan-300 mb-8">
              Welcome to the cyberpunk western frontier. Choose your path in the digital wild west.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <button 
                onClick={() => navigateTo('ranch')}
                className="nav-button bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800"
              >
                <span className="icon">🌾</span>
                <span className="text">Ranch</span>
              </button>
              <button 
                onClick={() => navigateTo('shadowMarket')}
                className="nav-button bg-gradient-to-r from-purple-900 to-purple-700 hover:from-purple-800 hover:to-purple-600"
              >
                <span className="icon">🧪</span>
                <span className="text">Shadow Market</span>
              </button>
              <button 
                onClick={() => navigateTo('saloon')}
                className="nav-button bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600"
              >
                <span className="icon">🎮</span>
                <span className="text">Saloon</span>
              </button>
            </div>
          </div>
        )}
        
        {currentScreen === 'ranch' && <RanchScreen />}
        {currentScreen === 'shadowMarket' && <ShadowMarketScreen />}
        {currentScreen === 'saloon' && (
          <div className="p-8 text-center">
            <h2 className="text-neon-pink text-3xl mb-4">Saloon</h2>
            <p className="text-cyan-300">Coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;