import React from 'react';
import { useGameState } from '../../hooks/useGameState';

interface NavBarProps {
  currentScene: 'ranch' | 'shadowMarket' | 'saloon';
  onRanchClick: () => void;
  onShadowMarketClick: () => void;
  onSaloonClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({
  currentScene,
  onRanchClick,
  onShadowMarketClick,
  onSaloonClick,
}) => {
  const { gameState } = useGameState();
  const player = gameState.player;
  
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <h1 className="text-neon-cyan font-pixel">Bull Run Boost</h1>
      </div>
      
      <nav className="navbar-links">
        <button 
          onClick={onRanchClick}
          className={`button ${currentScene === 'ranch' ? 'button-primary' : 'button-outline'}`}
        >
          Ranch
        </button>
        <button 
          onClick={onShadowMarketClick}
          className={`button ${currentScene === 'shadowMarket' ? 'button-primary' : 'button-outline'}`}
        >
          Shadow Market
        </button>
        <button 
          onClick={onSaloonClick}
          className={`button ${currentScene === 'saloon' ? 'button-primary' : 'button-outline'}`}
        >
          Saloon
        </button>
      </nav>
      
      <div className="navbar-user">
        {player ? (
          <div className="user-info">
            <div className="user-tokens">
              <span className="token-amount">{player.btBalance}</span>
              <span className="token-symbol">BT</span>
            </div>
            <div className="user-tokens">
              <span className="token-amount">{player.bcBalance}</span>
              <span className="token-symbol">BC</span>
            </div>
            <div className="user-level">
              <span className="level-text">LVL</span>
              <span className="level-number">{player.level}</span>
            </div>
          </div>
        ) : (
          <div className="user-info">
            <div className="user-tokens">
              <span className="token-amount">0</span>
              <span className="token-symbol">BT</span>
            </div>
            <div className="user-tokens">
              <span className="token-amount">0</span>
              <span className="token-symbol">BC</span>
            </div>
            <div className="user-level">
              <span className="level-text">LVL</span>
              <span className="level-number">1</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;