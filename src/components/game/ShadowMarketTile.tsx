import React from 'react';
import { ShadowMarketTile as ShadowMarketTileType } from '../../types';

interface ShadowMarketTileProps {
  tile?: ShadowMarketTileType;
  isLocked?: boolean;
  onClick: () => void;
}

const ShadowMarketTile: React.FC<ShadowMarketTileProps> = ({ 
  tile, 
  isLocked = false, 
  onClick 
}) => {
  // Determine appropriate CSS classes based on tile state
  const tileClasses = [
    'grid-tile',
    isLocked ? 'grid-tile-locked' : '',
    !tile ? 'grid-tile-empty' : '',
    tile?.hasLab ? 'grid-tile-lab' : '',
    tile?.status === 'producing' ? 'grid-tile-producing' : '',
    tile?.status === 'ready' ? 'grid-tile-ready' : ''
  ].filter(Boolean).join(' ');

  // Calculate production progress if applicable
  const getProgressPercentage = () => {
    if (tile?.productionStartTime && tile?.productionEndTime) {
      const now = Date.now();
      const total = tile.productionEndTime - tile.productionStartTime;
      const elapsed = now - tile.productionStartTime;
      
      if (elapsed >= total) return 100;
      return Math.floor((elapsed / total) * 100);
    }
    return 0;
  };

  // Get potion icon based on type
  const getPotionIcon = () => {
    switch (tile?.potionType) {
      case 'speed':
        return '⚡';
      case 'growth':
        return '🌱';
      case 'yield':
        return '💰';
      default:
        return '🧪';
    }
  };

  return (
    <div 
      className={tileClasses}
      onClick={isLocked ? undefined : onClick}
      title={isLocked ? "Locked - Expand your shadow market to unlock this tile" : undefined}
    >
      {isLocked && (
        <span className="grid-tile-icon">🔒</span>
      )}
      
      {!isLocked && !tile?.hasLab && (
        <span className="grid-tile-icon opacity-50">+</span>
      )}
      
      {tile?.hasLab && tile?.status === 'empty' && (
        <span className="grid-tile-icon">🧪</span>
      )}
      
      {tile?.status === 'producing' && (
        <span className="grid-tile-icon">{getPotionIcon()}</span>
      )}
      
      {tile?.status === 'ready' && (
        <span className="grid-tile-icon">{getPotionIcon()}</span>
      )}
      
      {/* Progress bar for producing potions */}
      {tile?.status === 'producing' && (
        <div 
          className="grid-tile-progress"
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      )}
    </div>
  );
};

export default ShadowMarketTile;