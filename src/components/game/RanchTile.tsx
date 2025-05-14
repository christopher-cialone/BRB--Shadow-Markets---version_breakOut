import React from 'react';
import { RanchTile as RanchTileType } from '../../types';

interface RanchTileProps {
  tile?: RanchTileType;
  isLocked?: boolean;
  onClick: () => void;
}

const RanchTile: React.FC<RanchTileProps> = ({ 
  tile, 
  isLocked = false, 
  onClick 
}) => {
  // Determine appropriate CSS classes based on tile state
  const tileClasses = [
    'grid-tile',
    isLocked ? 'grid-tile-locked' : '',
    !tile ? 'grid-tile-empty' : '',
    tile?.hasPassture ? 'grid-tile-pasture' : '',
    tile?.status === 'growing' ? 'grid-tile-growing' : '',
    tile?.status === 'ready' ? 'grid-tile-ready' : ''
  ].filter(Boolean).join(' ');

  // Calculate growth progress if applicable
  const getProgressPercentage = () => {
    if (tile?.growthStartTime && tile?.growthEndTime) {
      const now = Date.now();
      const total = tile.growthEndTime - tile.growthStartTime;
      const elapsed = now - tile.growthStartTime;
      
      if (elapsed >= total) return 100;
      return Math.floor((elapsed / total) * 100);
    }
    return 0;
  };

  return (
    <div 
      className={tileClasses}
      onClick={isLocked ? undefined : onClick}
      title={isLocked ? "Locked - Expand your ranch to unlock this tile" : undefined}
    >
      {isLocked && (
        <span className="grid-tile-icon">🔒</span>
      )}
      
      {!isLocked && !tile?.hasPassture && (
        <span className="grid-tile-icon opacity-50">+</span>
      )}
      
      {tile?.status === 'growing' && (
        <span className="grid-tile-icon">🌱</span>
      )}
      
      {tile?.status === 'ready' && (
        <span className="grid-tile-icon">🌾</span>
      )}
      
      {/* Progress bar for growing crops */}
      {tile?.status === 'growing' && (
        <div 
          className="grid-tile-progress"
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      )}
    </div>
  );
};

export default RanchTile;