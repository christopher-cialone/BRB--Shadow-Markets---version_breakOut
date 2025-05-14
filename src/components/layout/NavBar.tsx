import React from 'react';
import { useGameState } from '../../hooks/useGameState';

interface NavBarProps {
  currentScreen: 'main' | 'ranch' | 'shadowMarket' | 'saloon';
  onNavigate: (screen: 'main' | 'ranch' | 'shadowMarket' | 'saloon') => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentScreen, onNavigate }) => {
  const { gameState } = useGameState();
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <a href="#" className="nav-brand" onClick={() => onNavigate('main')}>
          Bull Run Boost
        </a>
      </div>
      
      <div className="navbar-center hidden md:flex">
        <ul className="nav-links">
          <li>
            <a 
              href="#" 
              className={`nav-link ${currentScreen === 'main' ? 'active' : ''}`} 
              onClick={() => onNavigate('main')}
            >
              Hub
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`nav-link ${currentScreen === 'ranch' ? 'active' : ''}`} 
              onClick={() => onNavigate('ranch')}
            >
              Ranch
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`nav-link ${currentScreen === 'shadowMarket' ? 'active' : ''}`} 
              onClick={() => onNavigate('shadowMarket')}
            >
              Shadow Market
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`nav-link ${currentScreen === 'saloon' ? 'active' : ''}`} 
              onClick={() => onNavigate('saloon')}
            >
              Saloon
            </a>
          </li>
        </ul>
      </div>
      
      <div className="navbar-end">
        <div className="flex items-center gap-4">
          <div className="text-sm flex items-center gap-2">
            <span className="text-neon-cyan">BT: {gameState.player?.btBalance || 0}</span>
            <span className="text-neon-pink">BC: {gameState.player?.bcBalance || 0}</span>
            <span className="text-amber-300">LVL: {gameState.player?.level || 1}</span>
          </div>
          
          <button 
            className="button button-primary text-xs py-1 px-3"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;