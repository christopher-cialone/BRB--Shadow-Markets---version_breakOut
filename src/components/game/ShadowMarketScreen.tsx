import React, { useState, useEffect } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useToast } from '../../hooks/useToast';
import ShadowMarketTile from './ShadowMarketTile';
import PotionLaboratoryModal from './PotionLaboratoryModal';
import StakingModal from './StakingModal';
import { ShadowMarketTile as ShadowMarketTileType } from '../../types';

const ShadowMarketScreen: React.FC = () => {
  const { gameState, dispatch, createLab, startPotionProduction, collectPotion } = useGameState();
  const { toast } = useToast();
  
  const [showPotionModal, setShowPotionModal] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  
  // Check for completed potions every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState.player) {
        const now = Date.now();
        gameState.player.shadowMarketTiles.forEach(tile => {
          if (
            tile.type === 'lab' && 
            tile.productionStarted && 
            tile.productionCompleted && 
            now >= tile.productionCompleted
          ) {
            // Notify if a potion is ready but not yet notified
            toast({
              title: 'Potion Ready',
              description: `Your ${tile.potionType} potion is ready to collect!`,
              variant: 'success'
            });
          }
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState.player, toast]);
  
  // Initialize player with shadow market tiles if needed
  const initializePlayerIfNeeded = () => {
    if (!gameState.player) {
      // Create initial player data
      dispatch({
        type: 'SET_PLAYER',
        payload: {
          id: 'player-1',
          name: 'Hacker',
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          btBalance: 50,
          bcBalance: 100,
          cattle: [],
          inventory: [],
          ranchTiles: [],
          shadowMarketTiles: Array(16).fill(null).map((_, index) => ({
            id: `shadow-tile-${index}`,
            position: index,
            type: index === 0 ? 'lab' : 
                  index === 1 ? 'market' : 
                  index === 2 ? 'staking' : 'empty',
            status: index < 9 ? 'active' : 'locked',
            potionType: index === 0 ? 'speed' : undefined,
            productionStarted: index === 0 ? Date.now() - (15 * 1000) : undefined, // Started 15 seconds ago
            productionCompleted: index === 0 ? Date.now() + (5 * 1000) : undefined // Completes in 5 seconds
          }))
        }
      });
    }
  };
  
  // Call this once to set up initial data
  initializePlayerIfNeeded();
  
  // Handle tile click
  const handleTileClick = (tile: ShadowMarketTileType) => {
    switch (tile.type) {
      case 'empty':
        // Show options to build different structures
        setSelectedTileId(tile.id);
        setShowPotionModal(true);
        break;
        
      case 'lab':
        if (tile.productionStarted && tile.productionCompleted) {
          // If production is complete
          if (Date.now() >= tile.productionCompleted) {
            // Collect potion
            collectPotion(tile.id);
            toast({
              title: 'Potion Collected',
              description: `You collected a ${tile.potionType} potion.`,
              variant: 'success'
            });
          } else {
            // Show production status
            const timeLeft = Math.ceil((tile.productionCompleted - Date.now()) / 1000);
            toast({
              title: 'Production in Progress',
              description: `Your ${tile.potionType} potion will be ready in ${timeLeft} seconds.`,
              variant: 'info'
            });
          }
        } else {
          // Start new production
          setSelectedTileId(tile.id);
          setShowPotionModal(true);
        }
        break;
        
      case 'market':
        // Show market interface
        toast({
          title: 'Shadow Market',
          description: 'Buy and sell goods in the black market',
          variant: 'info'
        });
        break;
        
      case 'staking':
        // Show staking interface
        setShowStakingModal(true);
        break;
    }
  };
  
  // Start potion production
  const handleStartProduction = (potionType: 'speed' | 'growth' | 'yield') => {
    if (!selectedTileId) return;
    
    const tile = gameState.player?.shadowMarketTiles.find(t => t.id === selectedTileId);
    
    if (!tile) return;
    
    if (tile.type === 'empty') {
      // Create a new lab
      createLab(selectedTileId, potionType);
      toast({
        title: 'Lab Created',
        description: `You created a new lab for brewing ${potionType} potions.`,
        variant: 'success'
      });
    }
    
    // Start production
    startPotionProduction(selectedTileId);
    
    toast({
      title: 'Production Started',
      description: `Your ${potionType} potion will be ready soon.`,
      variant: 'success'
    });
    
    setShowPotionModal(false);
  };
  
  return (
    <div className="shadow-market-screen">
      <div className="shadow-market-header">
        <h2 className="text-neon-pink font-pixel">Shadow Market</h2>
        <div className="market-actions">
          <button 
            className="button button-outline"
            onClick={() => {
              const randomReward = Math.floor(Math.random() * 30) + 10;
              if (gameState.player) {
                dispatch({
                  type: 'UPDATE_PLAYER',
                  payload: {
                    bcBalance: gameState.player.bcBalance + randomReward
                  }
                });
                toast({
                  title: 'Hack Successful',
                  description: `You hacked the system and gained ${randomReward} BC!`,
                  variant: 'success'
                });
              }
            }}
          >
            Hack for BC Tokens
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
              // Convert BT to BC
              if (gameState.player && gameState.player.btBalance >= 10) {
                dispatch({
                  type: 'UPDATE_PLAYER',
                  payload: {
                    btBalance: gameState.player.btBalance - 10,
                    bcBalance: gameState.player.bcBalance + 5
                  }
                });
                toast({
                  title: 'Token Conversion',
                  description: 'Converted 10 BT to 5 BC',
                  variant: 'success'
                });
              } else {
                toast({
                  title: 'Insufficient BT',
                  description: 'You need at least 10 BT to convert',
                  variant: 'error'
                });
              }
            }}
          >
            Convert BT → BC
          </button>
        </div>
      </div>
      
      <div className="shadow-market-content">
        <div className="shadow-market-grid">
          {gameState.player?.shadowMarketTiles.map(tile => (
            <ShadowMarketTile 
              key={tile.id}
              tile={tile}
              onClick={() => handleTileClick(tile)}
            />
          ))}
        </div>
        
        <div className="shadow-market-sidebar">
          <div className="market-info-card">
            <h3 className="text-neon-cyan font-pixel mb-2">Shadow Market Prices</h3>
            <div className="price-list">
              <div className="price-item">
                <span className="item-name">Speed Potion</span>
                <span className="item-price">35 BC</span>
              </div>
              <div className="price-item">
                <span className="item-name">Growth Potion</span>
                <span className="item-price">40 BC</span>
              </div>
              <div className="price-item">
                <span className="item-name">Yield Potion</span>
                <span className="item-price">45 BC</span>
              </div>
              <div className="price-item">
                <span className="item-name">Staking APY</span>
                <span className="item-price">15-40%</span>
              </div>
            </div>
          </div>
          
          <div className="market-info-card">
            <h3 className="text-neon-cyan font-pixel mb-2">Shadow Market Rules</h3>
            <ul className="rules-list">
              <li>1. No questions asked</li>
              <li>2. BC tokens only</li>
              <li>3. No refunds</li>
              <li>4. Don't trust anyone</li>
              <li>5. Encrypt everything</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <PotionLaboratoryModal 
        isOpen={showPotionModal}
        onClose={() => setShowPotionModal(false)}
        onStartProduction={handleStartProduction}
      />
      
      <StakingModal 
        isOpen={showStakingModal}
        onClose={() => setShowStakingModal(false)}
        poolType="laboratory"
      />
    </div>
  );
};

export default ShadowMarketScreen;