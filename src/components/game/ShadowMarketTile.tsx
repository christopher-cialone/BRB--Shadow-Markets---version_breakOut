import React from 'react';
import { ShadowMarketTile as ShadowMarketTileType } from '../../types';

interface ShadowMarketTileProps {
  tile: ShadowMarketTileType;
  onClick: () => void;
}

const ShadowMarketTile: React.FC<ShadowMarketTileProps> = ({ tile, onClick }) => {
  // Calculate production progress percentage if applicable
  const calculateProgress = (): number => {
    if (!tile.productionStarted || !tile.productionCompleted) return 0;
    
    const now = Date.now();
    const start = tile.productionStarted;
    const end = tile.productionCompleted;
    
    // If production is complete
    if (now >= end) return 100;
    
    // Calculate percentage
    const totalTime = end - start;
    const elapsed = now - start;
    return Math.floor((elapsed / totalTime) * 100);
  };
  
  // Render appropriate content based on tile type
  const renderTileContent = () => {
    switch (tile.type) {
      case 'lab':
        return (
          <div className="lab-content">
            {tile.productionStarted && tile.productionCompleted ? (
              <>
                <div className="production-type">
                  {tile.potionType === 'speed' && '⚡'}
                  {tile.potionType === 'growth' && '🌱'}
                  {tile.potionType === 'yield' && '💰'}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {calculateProgress() === 100 ? 'Ready' : `${calculateProgress()}%`}
                </div>
              </>
            ) : (
              <div className="lab-icon">🧪</div>
            )}
          </div>
        );
        
      case 'market':
        return <div className="market-content">🏪</div>;
        
      case 'staking':
        return <div className="staking-content">💎</div>;
        
      case 'empty':
      default:
        return <div className="empty-content">+</div>;
    }
  };
  
  // Get appropriate classes based on tile status and type
  const getTileClasses = () => {
    let classes = 'shadow-market-tile';
    
    // Add type-specific class
    classes += ` tile-${tile.type}`;
    
    // Add status-specific class
    classes += ` ${tile.status === 'locked' ? 'tile-locked' : 'tile-active'}`;
    
    // Add production-specific class if applicable
    if (tile.type === 'lab' && tile.productionStarted && tile.productionCompleted) {
      const progress = calculateProgress();
      if (progress === 100) {
        classes += ' production-complete';
      } else {
        classes += ' production-in-progress';
      }
    }
    
    return classes;
  };
  
  return (
    <div 
      className={getTileClasses()}
      onClick={tile.status === 'locked' ? undefined : onClick}
    >
      {renderTileContent()}
    </div>
  );
};

export default ShadowMarketTile;