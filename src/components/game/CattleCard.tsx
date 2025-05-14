import React from 'react';
import { CattleItem } from '../../types';

interface CattleCardProps {
  cattle: CattleItem;
  onFeed?: () => void;
  onMilk?: () => void;
  onSell?: () => void;
}

const CattleCard: React.FC<CattleCardProps> = ({
  cattle,
  onFeed,
  onMilk,
  onSell,
}) => {
  // Calculate time since last fed
  const getLastFedStatus = (): string => {
    if (!cattle.lastFed) return 'Never fed';
    
    const now = Date.now();
    const lastFed = cattle.lastFed;
    const hoursSinceLastFed = Math.floor((now - lastFed) / (1000 * 60 * 60));
    
    if (hoursSinceLastFed < 1) return 'Recently fed';
    if (hoursSinceLastFed < 24) return `Fed ${hoursSinceLastFed} hours ago`;
    return `Fed ${Math.floor(hoursSinceLastFed / 24)} days ago`;
  };
  
  // Calculate time since last milked (for cows only)
  const getLastMilkedStatus = (): string => {
    if (cattle.type !== 'cow') return '';
    if (!cattle.lastMilked) return 'Never milked';
    
    const now = Date.now();
    const lastMilked = cattle.lastMilked;
    const hoursSinceLastMilked = Math.floor((now - lastMilked) / (1000 * 60 * 60));
    
    if (hoursSinceLastMilked < 1) return 'Recently milked';
    if (hoursSinceLastMilked < 24) return `Milked ${hoursSinceLastMilked} hours ago`;
    return `Milked ${Math.floor(hoursSinceLastMilked / 24)} days ago`;
  };
  
  // Get health status color
  const getHealthStatusColor = (): string => {
    switch (cattle.healthStatus) {
      case 'healthy':
        return 'text-green-500';
      case 'hungry':
        return 'text-yellow-500';
      case 'sick':
        return 'text-red-500';
      default:
        return '';
    }
  };
  
  return (
    <div className="cattle-card">
      <div className="cattle-card-header">
        <h3 className="cattle-name">{cattle.name}</h3>
        <div className={`cattle-health ${getHealthStatusColor()}`}>
          {cattle.healthStatus}
        </div>
      </div>
      
      <div className="cattle-card-body">
        <div className="cattle-image">
          {cattle.type === 'cow' ? '🐄' : '🐂'}
        </div>
        
        <div className="cattle-stats">
          <div className="cattle-stat">
            <span className="stat-label">Type:</span>
            <span className="stat-value">{cattle.type}</span>
          </div>
          
          <div className="cattle-stat">
            <span className="stat-label">Level:</span>
            <span className="stat-value">{cattle.level}</span>
          </div>
          
          {cattle.type === 'cow' && cattle.milkRate && (
            <div className="cattle-stat">
              <span className="stat-label">Milk Rate:</span>
              <span className="stat-value">{cattle.milkRate}/day</span>
            </div>
          )}
          
          {cattle.type === 'bull' && cattle.breedingRate && (
            <div className="cattle-stat">
              <span className="stat-label">Breeding Rate:</span>
              <span className="stat-value">{cattle.breedingRate}/day</span>
            </div>
          )}
          
          <div className="cattle-stat">
            <span className="stat-label">Feeding:</span>
            <span className="stat-value">{getLastFedStatus()}</span>
          </div>
          
          {cattle.type === 'cow' && (
            <div className="cattle-stat">
              <span className="stat-label">Milking:</span>
              <span className="stat-value">{getLastMilkedStatus()}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="cattle-card-footer">
        {onFeed && (
          <button className="button button-outline" onClick={onFeed}>
            Feed
          </button>
        )}
        
        {cattle.type === 'cow' && onMilk && (
          <button 
            className="button button-primary"
            onClick={onMilk}
            disabled={cattle.lastMilked ? (Date.now() - cattle.lastMilked) < (12 * 60 * 60 * 1000) : false} // 12 hours cooldown
          >
            Milk
          </button>
        )}
        
        {onSell && (
          <button className="button button-outline" onClick={onSell}>
            Sell
          </button>
        )}
      </div>
    </div>
  );
};

export default CattleCard;