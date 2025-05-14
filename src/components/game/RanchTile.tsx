import React from 'react';
import { RanchTile as RanchTileType } from '../../types';

interface RanchTileProps {
  tile: RanchTileType;
  onClick: () => void;
}

const RanchTile: React.FC<RanchTileProps> = ({ tile, onClick }) => {
  // Render appropriate content based on tile type
  const renderTileContent = () => {
    switch (tile.type) {
      case 'pasture':
        return (
          <div className={`growth-stage-${tile.growthStage || 0}`}>
            {tile.growthStage === 3 ? (
              <div className="ready-indicator">✓</div>
            ) : (
              <div className="growth-indicator">{tile.growthStage || 0}/3</div>
            )}
          </div>
        );
        
      case 'barn':
        return (
          <div className="barn-content">
            {tile.cattleId ? (
              <div className="cattle-indicator">🐄</div>
            ) : (
              <div className="empty-indicator">Empty</div>
            )}
          </div>
        );
        
      case 'water':
        return <div className="water-content">💧</div>;
        
      case 'empty':
      default:
        return <div className="empty-content">+</div>;
    }
  };
  
  // Get appropriate classes based on tile status and type
  const getTileClasses = () => {
    let classes = 'ranch-tile';
    
    // Add type-specific class
    classes += ` tile-${tile.type}`;
    
    // Add status-specific class
    classes += ` ${tile.status === 'locked' ? 'tile-locked' : 'tile-active'}`;
    
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

export default RanchTile;