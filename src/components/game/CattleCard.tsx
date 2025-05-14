import React from 'react';
import { Cattle } from '../../types';

interface CattleCardProps {
  cattle: Cattle;
  onFeed: () => void;
  onMilk: () => void;
  canFeed: boolean;
  canMilk: boolean;
}

const CattleCard: React.FC<CattleCardProps> = ({
  cattle,
  onFeed,
  onMilk,
  canFeed,
  canMilk
}) => {
  // Format relative time for readability
  const formatRelativeTime = (timestamp?: number) => {
    if (!timestamp) return 'Not ready';
    
    const now = Date.now();
    if (now >= timestamp) return 'Ready now';
    
    const diffSeconds = Math.floor((timestamp - now) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
    return `${Math.floor(diffSeconds / 3600)}h ${Math.floor((diffSeconds % 3600) / 60)}m`;
  };
  
  // Check if milk is ready
  const isMilkReady = cattle.readyAt && Date.now() >= cattle.readyAt;
  
  // Check if feed has expired
  const hasFeedExpired = !cattle.feedExpiry || Date.now() >= cattle.feedExpiry;
  
  // Format ready time
  const readyTime = formatRelativeTime(cattle.readyAt);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="card-title">{cattle.name}</h3>
        <div className="text-amber-300">
          {'★'.repeat(cattle.quality)}
          {'☆'.repeat(5 - cattle.quality)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-3">
            <div className="text-neon-pink font-pixel mb-1">TYPE</div>
            <div>{cattle.type.replace('_', ' ').toUpperCase()}</div>
          </div>
          
          {cattle.type === 'milk_cow' && (
            <div className="mb-3">
              <div className="text-neon-pink font-pixel mb-1">MILK PRODUCTION</div>
              <div>{cattle.milkProduction || 'N/A'}</div>
            </div>
          )}
          
          {cattle.type === 'bull' && (
            <div className="mb-3">
              <div className="text-neon-pink font-pixel mb-1">RODEO STRENGTH</div>
              <div>{cattle.rodeoStrength || 'N/A'}</div>
            </div>
          )}
        </div>
        
        <div>
          <div className="mb-3">
            <div className="text-neon-pink font-pixel mb-1">STATUS</div>
            <div>
              {hasFeedExpired ? (
                <span className="text-yellow-400">Hungry</span>
              ) : isMilkReady ? (
                <span className="text-green-400">Ready for milking</span>
              ) : (
                <span className="text-cyan-400">Feeding ({readyTime})</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={onFeed}
              disabled={!canFeed}
              className={`button button-primary text-xs py-1 px-3 ${!canFeed ? 'button-disabled' : ''}`}
            >
              Feed (20 BT)
            </button>
            
            {cattle.type === 'milk_cow' && (
              <button
                onClick={onMilk}
                disabled={!canMilk}
                className={`button button-secondary text-xs py-1 px-3 ${!canMilk ? 'button-disabled' : ''}`}
              >
                Milk
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CattleCard;