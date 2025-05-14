import React, { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useToast } from '../../hooks/useToast';
import RanchTile from './RanchTile';
import CattleCard from './CattleCard';
import CattleShopModal from './CattleShopModal';
import StakingModal from './StakingModal';
import QuestNotification from './QuestNotification';
import { RanchTile as RanchTileType, Quest } from '../../types';

const RanchScreen: React.FC = () => {
  const { gameState, dispatch, feedCattle, milkCow, plantPassture, harvestPassture } = useGameState();
  const { toast } = useToast();
  
  const [showCattleShop, setShowCattleShop] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState<string | null>(null);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  
  // Mock data for initial development
  const initializePlayerIfNeeded = () => {
    if (!gameState.player) {
      // Create mock player data for development
      dispatch({
        type: 'SET_PLAYER',
        payload: {
          id: 'player-1',
          name: 'Cowboy',
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          btBalance: 150,
          bcBalance: 25,
          cattle: [
            {
              id: 'cow-1',
              type: 'cow',
              name: 'Bessie',
              level: 1,
              milkRate: 2,
              lastMilked: Date.now() - (24 * 60 * 60 * 1000), // 24 hours ago
              lastFed: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
              healthStatus: 'healthy'
            },
            {
              id: 'bull-1',
              type: 'bull',
              name: 'Ferdinand',
              level: 1,
              breedingRate: 1,
              lastFed: Date.now() - (8 * 60 * 60 * 1000), // 8 hours ago
              healthStatus: 'healthy'
            }
          ],
          inventory: [
            {
              id: 'inv-1',
              type: 'hay',
              quantity: 50
            },
            {
              id: 'inv-2',
              type: 'water',
              quantity: 40
            }
          ],
          ranchTiles: Array(16).fill(null).map((_, index) => ({
            id: `tile-${index}`,
            position: index,
            type: index % 5 === 0 ? 'pasture' : 
                  index % 7 === 0 ? 'barn' :
                  index % 9 === 0 ? 'water' : 'empty',
            status: index < 9 ? 'active' : 'locked',
            growthStage: index === 5 ? 2 : 0
          })),
          shadowMarketTiles: []
        }
      });
    }
  };
  
  // Call this once to set up mock data
  initializePlayerIfNeeded();
  
  // Handle tile click
  const handleTileClick = (tile: RanchTileType) => {
    switch (tile.type) {
      case 'empty':
        // Show options to build different structures
        toast({
          title: 'Build Options',
          description: 'You can build a pasture, barn, or water source here',
          variant: 'info'
        });
        break;
        
      case 'pasture':
        if (tile.growthStage === 3) {
          // Harvest if fully grown
          harvestPassture(tile.id);
          toast({
            title: 'Pasture Harvested',
            description: 'You harvested 10 hay from the pasture',
            variant: 'success'
          });
        } else {
          // Plant or water
          plantPassture(tile.id);
          toast({
            title: 'Pasture Updated',
            description: 'You tended to your pasture. It will grow over time.',
            variant: 'success'
          });
        }
        break;
        
      case 'barn':
        // Show cattle assigned to this barn, or options to assign cattle
        if (tile.cattleId) {
          setSelectedCattle(tile.cattleId);
        } else {
          toast({
            title: 'Empty Barn',
            description: 'No cattle assigned to this barn',
            variant: 'info'
          });
        }
        break;
        
      case 'water':
        // Collect water
        toast({
          title: 'Water Collected',
          description: 'You collected 5 water',
          variant: 'success'
        });
        break;
    }
  };
  
  // Handle feeding cattle
  const handleFeedCattle = (cattleId: string) => {
    feedCattle(cattleId);
    toast({
      title: 'Cattle Fed',
      description: 'You fed your cattle. Its health has improved.',
      variant: 'success'
    });
  };
  
  // Handle milking cattle
  const handleMilkCattle = (cattleId: string) => {
    milkCow(cattleId);
    toast({
      title: 'Cow Milked',
      description: 'You milked your cow and got 3 milk. You can sell this for BT.',
      variant: 'success'
    });
  };
  
  return (
    <div className="ranch-screen">
      <div className="ranch-header">
        <h2 className="text-neon-cyan font-pixel">Cyber Ranch</h2>
        <div className="ranch-actions">
          <button 
            className="button button-outline"
            onClick={() => setShowCattleShop(true)}
          >
            Buy Cattle
          </button>
          <button 
            className="button button-outline"
            onClick={() => setShowStakingModal(true)}
          >
            Staking Pool
          </button>
          <button 
            className="button button-outline"
            onClick={() => {
              setActiveQuest({
                id: 'quest-1',
                title: 'Ranch Hand',
                description: 'Feed all your cattle and milk your cows',
                type: 'daily',
                objectives: [
                  {
                    id: 'obj-1',
                    description: 'Feed all cattle',
                    target: 2,
                    current: 0,
                    type: 'feed'
                  },
                  {
                    id: 'obj-2',
                    description: 'Milk all cows',
                    target: 1,
                    current: 0,
                    type: 'milk'
                  }
                ],
                reward: {
                  btTokens: 25,
                  xp: 10
                },
                status: 'active'
              });
            }}
          >
            Show Sample Quest
          </button>
        </div>
      </div>
      
      <div className="ranch-content">
        <div className="ranch-grid">
          {gameState.player?.ranchTiles.map(tile => (
            <RanchTile 
              key={tile.id}
              tile={tile}
              onClick={() => handleTileClick(tile)}
            />
          ))}
        </div>
        
        <div className="ranch-sidebar">
          <h3 className="text-neon-pink font-pixel mb-4">Your Cattle</h3>
          {gameState.player?.cattle.map(cattle => (
            <CattleCard 
              key={cattle.id}
              cattle={cattle}
              onFeed={() => handleFeedCattle(cattle.id)}
              onMilk={cattle.type === 'cow' ? () => handleMilkCattle(cattle.id) : undefined}
            />
          ))}
          {(!gameState.player?.cattle || gameState.player.cattle.length === 0) && (
            <div className="empty-state">
              <p>You don't have any cattle yet.</p>
              <button 
                className="button button-primary mt-2"
                onClick={() => setShowCattleShop(true)}
              >
                Buy Your First Cattle
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <CattleShopModal 
        isOpen={showCattleShop}
        onClose={() => setShowCattleShop(false)}
      />
      
      <StakingModal 
        isOpen={showStakingModal}
        onClose={() => setShowStakingModal(false)}
        poolType="pasture"
      />
      
      {activeQuest && (
        <QuestNotification 
          quest={activeQuest}
          onView={() => setActiveQuest(null)}
        />
      )}
    </div>
  );
};

export default RanchScreen;