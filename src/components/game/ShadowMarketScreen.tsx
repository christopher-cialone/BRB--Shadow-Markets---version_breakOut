import React, { useEffect, useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useToast } from '../../hooks/useToast';
import { PageLayout } from '../layout/PageLayout';
import ShadowMarketTile from './ShadowMarketTile';
import StakingModal from './StakingModal';
import PotionLaboratoryModal from './PotionLaboratoryModal';
import QuestNotification from './QuestNotification';

// Import shadow market background SVG as string
const nightMarketSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
  <!-- Sky gradient -->
  <defs>
    <linearGradient id="nightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#1e0030" stop-opacity="0.7"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="400" fill="url(#nightGradient)"/>
  
  <!-- Stars -->
  <g fill="#ffffff">
    <circle cx="50" cy="50" r="1" opacity="0.8" />
    <circle cx="150" cy="30" r="1.5" opacity="0.7" />
    <circle cx="250" cy="70" r="1" opacity="0.6" />
    <circle cx="350" cy="40" r="1.2" opacity="0.9" />
    <circle cx="450" cy="80" r="1" opacity="0.7" />
    <circle cx="550" cy="20" r="1.3" opacity="0.8" />
    <circle cx="650" cy="60" r="1" opacity="0.7" />
    <circle cx="750" cy="30" r="1.1" opacity="0.9" />
    <circle cx="100" cy="90" r="1" opacity="0.6" />
    <circle cx="200" cy="50" r="1.2" opacity="0.7" />
    <circle cx="300" cy="10" r="1" opacity="0.8" />
    <circle cx="400" cy="70" r="1.4" opacity="0.7" />
    <circle cx="500" cy="40" r="1" opacity="0.9" />
    <circle cx="600" cy="90" r="1.3" opacity="0.8" />
    <circle cx="700" cy="50" r="1" opacity="0.7" />
  </g>
  
  <!-- Purple moon -->
  <circle cx="650" cy="80" r="30" fill="#6a2ca0" opacity="0.8" filter="url(#glow)"/>
  
  <!-- Neon city outlines -->
  <g stroke="#00ffff" stroke-width="1" fill="none" opacity="0.6" filter="url(#glow)">
    <path d="M50,320 L50,270 L70,270 L70,290 L90,290 L90,260 L110,260 L110,290 L130,290 L130,270 L150,270 L150,320" />
    <path d="M180,320 L180,250 L230,250 L230,320" />
    <path d="M260,320 L260,280 L280,280 L280,260 L300,260 L300,280 L320,280 L320,320" />
    <path d="M340,320 L340,240 L400,240 L400,320" />
  </g>
  
  <g stroke="#ff44cc" stroke-width="1" fill="none" opacity="0.6" filter="url(#glow)">
    <path d="M430,320 L430,250 L450,230 L470,250 L470,320" />
    <path d="M500,320 L500,260 L520,260 L520,280 L540,280 L540,260 L560,260 L560,320" />
    <path d="M590,320 L590,250 L610,230 L630,230 L650,250 L650,320" />
    <path d="M680,320 L680,270 L720,270 L720,320" />
    <path d="M740,320 L740,260 L760,260 L760,320" />
  </g>
  
  <!-- Ground -->
  <rect x="0" y="320" width="800" height="80" fill="#1a0022"/>
</svg>
`;

const ShadowMarketScreen: React.FC = () => {
  const { gameState, dispatch, createLab, startPotionProduction, collectPotion } = useGameState();
  const { toast } = useToast();
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedLabTile, setSelectedLabTile] = useState<number | null>(null);
  
  // Set screen to shadowMarket when component mounts
  useEffect(() => {
    dispatch({ type: 'SET_SCREEN', payload: 'shadowMarket' });
  }, [dispatch]);
  
  const handleCreateLab = async (tileId: number) => {
    try {
      await createLab(tileId);
      toast({
        title: 'Lab Created',
        description: 'You have successfully built a laboratory on this tile',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create lab',
        variant: 'error'
      });
    }
  };
  
  const handleStartProduction = async (tileId: number, potionType: 'speed' | 'growth' | 'yield') => {
    try {
      await startPotionProduction(tileId, potionType);
      setShowLabModal(false);
      
      toast({
        title: 'Production Started',
        description: `Started brewing a ${potionType} potion`,
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start production',
        variant: 'error'
      });
    }
  };
  
  const handleCollectPotion = async (tileId: number) => {
    try {
      await collectPotion(tileId);
      toast({
        title: 'Potion Collected',
        description: 'You successfully collected the potion and earned BC tokens',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to collect potion',
        variant: 'error'
      });
    }
  };
  
  // Function to create a new shadow market tile at specific coordinates
  const createShadowMarketTile = async (position: { x: number; y: number }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Verify the player has enough BC tokens to expand (40 BC)
      if (!gameState.player || gameState.player.bcBalance < 40) {
        throw new Error('Not enough BC tokens to expand your shadow market. Need 40 BC');
      }
      
      // Create new unlocked tile
      const newTile = {
        id: Math.max(...gameState.shadowMarketTiles.map(t => t.id), 0) + 1,
        position,
        hasLab: false,
        isLocked: false
      };
      
      // Update player balance
      const updatedPlayer = {
        ...gameState.player,
        bcBalance: gameState.player.bcBalance - 40
      };
      
      // Update state
      dispatch({ type: 'ADD_SHADOW_MARKET_TILE', payload: newTile });
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
      
      toast({
        title: 'Shadow Market Expanded',
        description: 'You have successfully claimed a new tile for your shadow market!',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to expand shadow market',
        variant: 'error'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const handleTileClick = (tile: typeof gameState.shadowMarketTiles[0] | null, position?: { x: number, y: number }) => {
    if (!tile && position) {
      // This is an empty space - check if we can expand here
      const isNearUnlocked = gameState.shadowMarketTiles.some(t => 
        !t.isLocked && 
        Math.abs(t.position.x - position.x) <= 1 && 
        Math.abs(t.position.y - position.y) <= 1
      );
      
      if (isNearUnlocked) {
        createShadowMarketTile(position);
      }
      return;
    }
    
    if (!tile) return;
    
    dispatch({ type: 'SET_SELECTED_TILE', payload: tile });
    
    if (tile.isLocked) {
      toast({
        title: 'Tile Locked',
        description: 'This tile is locked. Expand your territory to unlock adjacent tiles.',
        variant: 'warning'
      });
      return;
    }
    
    if (!tile.hasLab) {
      // Offer to build a lab
      handleCreateLab(tile.id);
      return;
    }
    
    if (tile.status === 'empty') {
      // Show lab modal to start production
      setSelectedLabTile(tile.id);
      setShowLabModal(true);
      return;
    }
    
    if (tile.status === 'ready') {
      // Collect the potion
      handleCollectPotion(tile.id);
      return;
    }
    
    if (tile.status === 'producing') {
      const endTime = tile.productionEndTime;
      if (endTime) {
        const remaining = Math.max(0, endTime - Date.now());
        const seconds = Math.ceil(remaining / 1000);
        
        toast({
          title: 'Production in Progress',
          description: `Your ${tile.potionType} potion will be ready in ${seconds} seconds`,
          variant: 'info'
        });
      }
    }
  };
  
  return (
    <PageLayout
      title="Shadow Market Laboratory"
      subtitle="Brew powerful potions and create shadow market products for the underground economy"
    >
      <div id="shadow-market-screen" className="relative mt-4">
        <div className="relative z-0" dangerouslySetInnerHTML={{ __html: nightMarketSVG }} />
        
        {/* Shadow Market content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-4">
          <div className="bg-neutral-dark/80 backdrop-blur-sm rounded-lg p-4 w-full max-w-4xl">
            <h2 className="font-pixel text-lg text-center text-neon-purple mb-4">UNDERGROUND LABS</h2>
            
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
                <div className="stat-label">Labs</div>
                <div className="stat-value">
                  {gameState.shadowMarketTiles.filter(t => t.hasLab).length}
                </div>
              </div>
            </div>
            
            {/* Shadow Market tilemap grid */}
            <div className="shadow-grid mb-6">
              {/* Display the shadow market grid in a 4x4 layout */}
              {(() => {
                // Create a 4x4 grid with placeholders
                const grid = Array(4).fill(0).map(() => Array(4).fill(null));
                
                // Fill in the available tiles
                gameState.shadowMarketTiles.forEach(tile => {
                  const x = tile.position.x;
                  const y = tile.position.y;
                  if (x >= 0 && x < 4 && y >= 0 && y < 4) {
                    grid[y][x] = tile;
                  }
                });
                
                // Render the entire grid
                return grid.flatMap((row, y) => 
                  row.map((tile, x) => {
                    // If we have a tile at this position
                    if (tile) {
                      return (
                        <ShadowMarketTile 
                          key={`${x}-${y}`}
                          tile={tile}
                          isLocked={tile.isLocked}
                          onClick={() => handleTileClick(tile)}
                        />
                      );
                    } else {
                      // If this is within the 2x2 grid around (1,1), it should be unlockable
                      const isNearCenter = Math.abs(x - 1.5) <= 0.5 && Math.abs(y - 1.5) <= 0.5;
                      
                      return (
                        <ShadowMarketTile 
                          key={`empty-${x}-${y}`}
                          isLocked={!isNearCenter}
                          onClick={() => handleTileClick(null, { x, y })}
                        />
                      );
                    }
                  })
                );
              })()}
            </div>
            
            {/* Shadow Market info */}
            <div className="card mb-4">
              <h3 className="card-title">Shadow Market Operations</h3>
              <p className="mb-2 text-sm text-cyan-300">
                Build labs in the shadow market to produce potions that enhance your cattle and crops.
                Trade these potions for BC tokens in the underground economy.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-2 bg-neutral-dark/60 rounded-md text-center">
                  <div className="text-lg mb-1">⚡</div>
                  <div className="text-sm font-pixel text-neon-pink">Speed Potion</div>
                  <div className="text-xs text-gray-400">20 BC</div>
                </div>
                <div className="p-2 bg-neutral-dark/60 rounded-md text-center">
                  <div className="text-lg mb-1">🌱</div>
                  <div className="text-sm font-pixel text-neon-pink">Growth Potion</div>
                  <div className="text-xs text-gray-400">20 BC</div>
                </div>
                <div className="p-2 bg-neutral-dark/60 rounded-md text-center">
                  <div className="text-lg mb-1">💰</div>
                  <div className="text-sm font-pixel text-neon-pink">Yield Potion</div>
                  <div className="text-xs text-gray-400">20 BC</div>
                </div>
              </div>
            </div>
            
            {/* Shadow Market controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowStakingModal(true)}
                className="button button-primary flex-1"
              >
                🔒 Staking & Expansion
              </button>
            </div>
          </div>
        </div>
        
        {/* Potion laboratory modal */}
        {showLabModal && selectedLabTile !== null && (
          <PotionLaboratoryModal
            isOpen={showLabModal}
            onClose={() => {
              setShowLabModal(false);
              setSelectedLabTile(null);
            }}
            onStartProduction={(potionType) => handleStartProduction(selectedLabTile, potionType)}
          />
        )}
        
        {/* Staking modal */}
        {showStakingModal && (
          <StakingModal
            isOpen={showStakingModal}
            onClose={() => setShowStakingModal(false)}
            poolType="laboratory"
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

export default ShadowMarketScreen;