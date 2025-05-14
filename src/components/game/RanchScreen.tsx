import React, { useEffect, useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useToast } from '../../hooks/useToast';
import { PageLayout } from '../layout/PageLayout';
import RanchTile from './RanchTile';
import CattleCard from './CattleCard';
import CattleShopModal from './CattleShopModal';
import StakingModal from './StakingModal';
import QuestNotification from './QuestNotification';

// Import landscape SVG as string (to be created)
const landscapeSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
  <!-- Sky gradient -->
  <defs>
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff44cc" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#6a2ca0" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="400" fill="url(#skyGradient)"/>
  
  <!-- Sun/Moon -->
  <circle cx="650" cy="80" r="40" fill="#ffcc00" filter="drop-shadow(0 0 20px rgba(255, 204, 0, 0.8))"/>
  
  <!-- Mountains -->
  <path d="M0,250 L100,180 L200,230 L300,150 L400,220 L500,120 L600,190 L700,150 L800,240 L800,400 L0,400 Z" fill="#3a1c78" opacity="0.8"/>
  <path d="M0,280 L120,220 L220,270 L320,190 L420,260 L520,180 L620,240 L720,190 L800,260 L800,400 L0,400 Z" fill="#261758" opacity="0.9"/>
  
  <!-- Neon Lights -->
  <path d="M150,270 L160,260 L170,270 L180,265 L190,275 L200,265" stroke="#00ffff" stroke-width="1" fill="none" stroke-opacity="0.8"/>
  <path d="M550,280 L560,270 L570,280 L580,275 L590,285 L600,275" stroke="#ff44cc" stroke-width="1" fill="none" stroke-opacity="0.8"/>
  
  <!-- Ground -->
  <rect x="0" y="320" width="800" height="80" fill="#331a52"/>
</svg>
`;

const RanchScreen: React.FC = () => {
  const { gameState, dispatch, feedCattle, milkCow, plantPassture } = useGameState();
  const { toast } = useToast();
  const [showCattleShop, setShowCattleShop] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  
  // Set screen to ranch when component mounts
  useEffect(() => {
    dispatch({ type: 'SET_SCREEN', payload: 'ranch' });
  }, [dispatch]);
  
  // Auto-select first cattle if none selected and cattle are available
  useEffect(() => {
    if (!gameState.selectedCattle && gameState.cattle.length > 0) {
      dispatch({ type: 'SET_SELECTED_CATTLE', payload: gameState.cattle[0] });
    }
  }, [gameState.selectedCattle, gameState.cattle, dispatch]);
  
  const handleFeed = async () => {
    if (gameState.selectedCattle) {
      try {
        await feedCattle(gameState.selectedCattle.id);
        toast({
          title: 'Cattle Fed',
          description: 'Your cattle has been fed and will produce resources soon',
          variant: 'success'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to feed cattle',
          variant: 'error'
        });
      }
    }
  };
  
  const handleMilk = async () => {
    if (gameState.selectedCattle && gameState.selectedCattle.type === 'milk_cow') {
      try {
        await milkCow(gameState.selectedCattle.id);
        toast({
          title: 'Milk Collected',
          description: 'You have successfully collected milk from your cow',
          variant: 'success'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to milk cow',
          variant: 'error'
        });
      }
    }
  };
  
  const handlePlantPassture = async (tileId: number) => {
    try {
      await plantPassture(tileId);
      toast({
        title: 'Pasture Planted',
        description: 'You have successfully planted pasture in this plot',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to plant pasture',
        variant: 'error'
      });
    }
  };
  
  // Function to create a new ranch tile at specific coordinates
  const createRanchTile = async (position: { x: number; y: number }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Verify the player has enough BT tokens to expand (25 BT)
      if (!gameState.player || gameState.player.btBalance < 25) {
        throw new Error('Not enough BT tokens to expand your ranch. Need 25 BT');
      }
      
      // Create new unlocked tile
      const newTile = {
        id: Math.max(...gameState.ranchTiles.map(t => t.id), 0) + 1,
        position,
        hasPassture: false,
        isLocked: false
      };
      
      // Update player balance
      const updatedPlayer = {
        ...gameState.player,
        btBalance: gameState.player.btBalance - 25
      };
      
      // Update state
      dispatch({ type: 'ADD_RANCH_TILE', payload: newTile });
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
      
      toast({
        title: 'Ranch Expanded',
        description: 'You have successfully claimed a new tile for your ranch!',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to expand ranch',
        variant: 'error'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const isMilkReady = gameState.selectedCattle && 
    gameState.selectedCattle.readyAt && 
    Date.now() >= gameState.selectedCattle.readyAt;
  
  const isFeedExpired = !gameState.selectedCattle || 
    !gameState.selectedCattle.feedExpiry || 
    Date.now() >= gameState.selectedCattle.feedExpiry;
  
  return (
    <PageLayout
      title="Bull Run Ranch"
      subtitle="Manage your cattle and expand your ranch operations"
    >
      <div id="ranch-screen" className="relative mt-4">
        <div className="relative z-0" dangerouslySetInnerHTML={{ __html: landscapeSVG }} />
        
        {/* Ranch content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-4">
          <div className="bg-neutral-dark/80 backdrop-blur-sm rounded-lg p-4 w-full max-w-4xl">
            <h2 className="font-pixel text-lg text-center text-amber-400 mb-4">ROOKIE RANCH</h2>
            
            {/* Stats panel */}
            <div className="stats-panel mb-6">
              <div className="stat-item">
                <div className="stat-label">BT Balance</div>
                <div className="stat-value">{gameState.player?.btBalance || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">BC Balance</div>
                <div className="stat-value">{gameState.player?.bcBalance || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Level</div>
                <div className="stat-value">{gameState.player?.level || 1}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">XP</div>
                <div className="stat-value">
                  {gameState.player?.xp || 0}/{gameState.player?.xpToNextLevel || 100}
                </div>
              </div>
            </div>
            
            {/* Ranch tilemap grid */}
            <div className="ranch-grid mb-6">
              {/* Display the ranch grid in a 5x5 layout */}
              {(() => {
                // Create a 5x5 grid with placeholders
                const grid = Array(5).fill(0).map(() => Array(5).fill(null));
                
                // Fill in the available tiles
                gameState.ranchTiles.forEach(tile => {
                  const x = tile.position.x;
                  const y = tile.position.y;
                  if (x >= 0 && x < 5 && y >= 0 && y < 5) {
                    grid[y][x] = tile;
                  }
                });
                
                // Render the entire grid
                return grid.flatMap((row, y) => 
                  row.map((tile, x) => {
                    // If we have a tile at this position
                    if (tile) {
                      return (
                        <RanchTile 
                          key={`${x}-${y}`}
                          tile={tile}
                          isLocked={tile.isLocked}
                          onClick={() => {
                            dispatch({ type: 'SET_SELECTED_TILE', payload: tile });
                            if (!tile.hasPassture && !tile.isLocked) {
                              handlePlantPassture(tile.id);
                            }
                          }}
                        />
                      );
                    } else {
                      // If this is within the 3x3 grid around (2,2), it should be unlockable
                      const isNearCenter = Math.abs(x - 2) <= 1 && Math.abs(y - 2) <= 1;
                      const isNearUnlocked = gameState.ranchTiles.some(t => 
                        !t.isLocked && 
                        Math.abs(t.position.x - x) <= 1 && 
                        Math.abs(t.position.y - y) <= 1
                      );
                      
                      const canUnlock = !isNearCenter && isNearUnlocked;
                      
                      return (
                        <RanchTile 
                          key={`empty-${x}-${y}`}
                          isLocked={!isNearCenter && !canUnlock}
                          onClick={() => {
                            if (canUnlock) {
                              // Can create a new tile here since it's adjacent to an unlocked tile
                              createRanchTile({ x, y });
                            } else if (isNearCenter) {
                              // This is in the initial unlockable area
                              handlePlantPassture(-1);
                            }
                          }}
                        />
                      );
                    }
                  })
                );
              })()}
            </div>
            
            {/* Cow management actions */}
            {gameState.selectedCattle && (
              <CattleCard
                cattle={gameState.selectedCattle}
                onFeed={handleFeed}
                onMilk={handleMilk}
                canFeed={Boolean(!gameState.loading && gameState.player && gameState.player.btBalance >= 20)}
                canMilk={Boolean(!gameState.loading && isMilkReady && gameState.selectedCattle.type === 'milk_cow')}
              />
            )}
            
            {/* Ranch controls */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowCattleShop(true)}
                className="button button-amber flex-1"
              >
                🐄 Cattle Shop
              </button>
              
              <button
                onClick={() => setShowStakingModal(true)}
                className="button button-primary flex-1"
              >
                🔒 Staking & Expansion
              </button>
            </div>
          </div>
        </div>
        
        {/* Cattle shop modal */}
        {showCattleShop && (
          <CattleShopModal
            isOpen={showCattleShop}
            onClose={() => setShowCattleShop(false)}
          />
        )}
        
        {/* Staking modal */}
        {showStakingModal && (
          <StakingModal
            isOpen={showStakingModal}
            onClose={() => setShowStakingModal(false)}
            poolType="pasture"
          />
        )}
        
        {/* Quest notification */}
        {gameState.showQuestNotification && gameState.activeQuest && (
          <QuestNotification
            quest={gameState.activeQuest}
            onView={() => dispatch({ type: 'HIDE_QUEST_NOTIFICATION' })}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default RanchScreen;