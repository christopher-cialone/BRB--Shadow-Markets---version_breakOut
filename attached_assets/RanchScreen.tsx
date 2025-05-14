import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useGameState } from '@/hooks/use-game-state';
import { useToast } from '@/hooks/use-toast';
import CattleShopModal from '@/components/game/CattleShopModal';
import QuestNotification from '@/components/game/QuestNotification';
import RanchTile from '@/components/game/RanchTile';
import CattleCard from '@/components/game/CattleCard';
import StakingModal from '@/components/game/StakingModal';
import { landscapeSVG } from '@/assets';
import { formatRelativeTime, isReadyToMilk, hasFeedExpired } from '@/lib/game';
import { PageLayout } from '@/components/layout/PageLayout';

const RanchScreen: React.FC = () => {
  const [, setLocation] = useLocation();
  const { gameState, dispatch, feedCattle, milkCow, plantPassture } = useGameState();
  const { toast } = useToast();
  const [showCattleShop, setShowCattleShop] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  
  // Set screen to ranch only once when component mounts
  useEffect(() => {
    dispatch({ type: 'SET_SCREEN', payload: 'ranch' });
  }, [dispatch]);

  // Auto-select first cattle if none selected and cattle are available
  useEffect(() => {
    if (!gameState.selectedCattle && gameState.cattle.length > 0) {
      dispatch({ type: 'SET_SELECTED_CATTLE', payload: gameState.cattle[0] });
    }
  }, [gameState.selectedCattle, gameState.cattle, dispatch]);

  const handleBackToHub = () => {
    setLocation('/hub');
  };

  const handleFeed = async () => {
    if (gameState.selectedCattle) {
      await feedCattle(gameState.selectedCattle.id);
    }
  };

  const handleMilk = async () => {
    if (gameState.selectedCattle && gameState.selectedCattle.type === 'milk_cow') {
      await milkCow(gameState.selectedCattle.id);
    }
  };

  const handlePlantPassture = async (tileId: number) => {
    await plantPassture(tileId);
  };
  
  // Function to create a new ranch tile at specific coordinates
  const createRanchTile = async (position: { x: number; y: number }) => {
    if (!gameState.player) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Make API request to create new tile
      const response = await fetch('/api/ranch-tiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: gameState.player.id,
          position: position,
          hasPassture: false,
          isLocked: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create ranch tile. Try again later.');
      }
      
      const newTile = await response.json();
      
      // Add new tile to the game state
      dispatch({ type: 'ADD_RANCH_TILE', payload: newTile });
      
      // Refresh player data to update balances
      const playerResponse = await fetch(`/api/players/${gameState.player.id}`);
      if (playerResponse.ok) {
        const updatedPlayer = await playerResponse.json();
        dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
      }
      
      toast({
        title: 'Ranch Expanded',
        description: 'You have successfully claimed a new tile for your ranch!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const isMilkReady = gameState.selectedCattle 
    ? isReadyToMilk(gameState.selectedCattle.readyAt) 
    : false;
  
  const isFeedExpired = gameState.selectedCattle 
    ? hasFeedExpired(gameState.selectedCattle.feedExpiry) 
    : true;

  const readyTime = gameState.selectedCattle 
    ? formatRelativeTime(gameState.selectedCattle.readyAt) 
    : "Not ready";
  
  // We no longer need this function as we have the inline grid renderer
  // This avoids duplication

  return (
    <PageLayout
      title="Bull Run Ranch"
      subtitle="Manage your cattle and expand your ranch operations"
    >
      <div id="ranch-screen" className="relative mt-4">
        <div className="relative z-0" dangerouslySetInnerHTML={{ __html: landscapeSVG }} />
        
        {/* Ranch content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-4">
          <div className="bg-neutral-dark/80 rounded-lg p-4 w-full max-w-lg">
            <h2 className="font-pixel text-lg text-center text-secondary-amber mb-4">ROOKIE RANCH</h2>
            
            {/* Ranch tilemap grid */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {/* Display the ranch grid in a 5x5 layout */}
              {(() => {
                // Create a 5x5 grid with placeholders
                const grid = Array(5).fill(0).map(() => Array(5).fill(null));
                
                // Fill in the available tiles
                gameState.ranchTiles.forEach(tile => {
                  const x = (tile.position as any).x;
                  const y = (tile.position as any).y;
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
                      
                      return (
                        <RanchTile 
                          key={`empty-${x}-${y}`}
                          isLocked={!isNearCenter} // Unlocked if near center (3x3 grid)
                          onClick={() => {
                            if (isNearCenter) {
                              // We can create a new tile here
                              createRanchTile({ x, y });
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
            <div className="flex gap-2">
              <Button
                id="btn-shop"
                onClick={() => setShowCattleShop(true)}
                className="flex-1 font-pixel text-xs bg-secondary-amber hover:bg-amber-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
              >
                CATTLE SHOP
              </Button>
              
              <Button
                id="btn-expand"
                onClick={() => setShowStakingModal(true)}
                className="flex-1 font-pixel text-xs bg-primary-blue hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
              >
                EXPAND RANCH
              </Button>
            </div>
          </div>
        </div>
        
        {/* Back button */}
        <Button
          id="btn-back-to-hub"
          onClick={handleBackToHub}
          className="absolute top-4 left-4 z-20 font-pixel text-xs bg-neutral-dark/90 hover:bg-neutral-dark border-2 border-secondary-purple text-white py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </Button>
        
        {/* Cattle shop modal */}
        <CattleShopModal
          isOpen={showCattleShop}
          onClose={() => setShowCattleShop(false)}
          onBuy={(type, name) => {
            setShowCattleShop(false);
          }}
        />
        
        {/* Staking modal */}
        <StakingModal
          isOpen={showStakingModal}
          onClose={() => setShowStakingModal(false)}
          poolType="pasture"
        />
        
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