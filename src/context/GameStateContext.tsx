import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { GameState, GameAction } from '../types';

// Initial state
const initialState: GameState = {
  player: {
    id: 'player1',
    name: 'Cowboy',
    btBalance: 100,
    bcBalance: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    archetype: 'Entrepreneur'
  },
  ranchTiles: Array(25).fill(null).map((_, index) => ({
    id: index,
    position: {
      x: index % 5,
      y: Math.floor(index / 5)
    },
    hasPassture: false,
    isLocked: !(
      // Only the center 3x3 grid is unlocked initially
      (Math.floor(index / 5) >= 1 && Math.floor(index / 5) <= 3) &&
      (index % 5 >= 1 && index % 5 <= 3)
    )
  })),
  shadowMarketTiles: Array(16).fill(null).map((_, index) => ({
    id: index,
    position: {
      x: index % 4,
      y: Math.floor(index / 4)
    },
    hasLab: false,
    isLocked: !(
      // Only the center 2x2 grid is unlocked initially
      (Math.floor(index / 4) >= 1 && Math.floor(index / 4) <= 2) &&
      (index % 4 >= 1 && index % 4 <= 2)
    )
  })),
  cattle: [],
  quests: [
    {
      id: 'quest1',
      title: 'Beginner Farmer',
      description: 'Plant 5 crops in your ranch',
      goal: {
        type: 'plant',
        count: 5,
        current: 0
      },
      reward: {
        btTokens: 50,
        xp: 50
      },
      completed: false
    },
    {
      id: 'quest2',
      title: 'First Harvest',
      description: 'Harvest 3 crops from your ranch',
      goal: {
        type: 'harvest',
        count: 3,
        current: 0
      },
      reward: {
        btTokens: 30,
        xp: 30
      },
      completed: false
    }
  ],
  activeQuest: null,
  selectedCattle: null,
  selectedTile: null,
  loading: false,
  error: null,
  screen: 'main',
  notifications: [],
  showQuestNotification: false
};

// Create context
const GameStateContext = createContext<{
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Add functions here for game actions
  feedCattle: (cattleId: number) => Promise<void>;
  milkCow: (cattleId: number) => Promise<void>;
  plantPassture: (tileId: number) => Promise<void>;
  createLab: (tileId: number) => Promise<void>;
  startPotionProduction: (tileId: number, potionType: 'speed' | 'growth' | 'yield') => Promise<void>;
  collectPotion: (tileId: number) => Promise<void>;
  purchaseCattle: (type: 'milk_cow' | 'beef_cow' | 'bull', name: string) => Promise<void>;
}>({
  gameState: initialState,
  dispatch: () => {},
  feedCattle: async () => {},
  milkCow: async () => {},
  plantPassture: async () => {},
  createLab: async () => {},
  startPotionProduction: async () => {},
  collectPotion: async () => {},
  purchaseCattle: async () => {}
});

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    
    case 'SET_RANCH_TILES':
      return { ...state, ranchTiles: action.payload };
    
    case 'ADD_RANCH_TILE':
      return { ...state, ranchTiles: [...state.ranchTiles, action.payload] };
    
    case 'UPDATE_RANCH_TILE':
      return {
        ...state,
        ranchTiles: state.ranchTiles.map(tile => 
          tile.id === action.payload.id ? action.payload : tile
        )
      };
    
    case 'SET_SHADOW_MARKET_TILES':
      return { ...state, shadowMarketTiles: action.payload };
    
    case 'ADD_SHADOW_MARKET_TILE':
      return { ...state, shadowMarketTiles: [...state.shadowMarketTiles, action.payload] };
    
    case 'UPDATE_SHADOW_MARKET_TILE':
      return {
        ...state,
        shadowMarketTiles: state.shadowMarketTiles.map(tile => 
          tile.id === action.payload.id ? action.payload : tile
        )
      };
    
    case 'SET_CATTLE':
      return { ...state, cattle: action.payload };
    
    case 'ADD_CATTLE':
      return { ...state, cattle: [...state.cattle, action.payload] };
    
    case 'UPDATE_CATTLE':
      return {
        ...state,
        cattle: state.cattle.map(cattle => 
          cattle.id === action.payload.id ? action.payload : cattle
        ),
        selectedCattle: state.selectedCattle?.id === action.payload.id 
          ? action.payload 
          : state.selectedCattle
      };
    
    case 'REMOVE_CATTLE':
      return {
        ...state,
        cattle: state.cattle.filter(cattle => cattle.id !== action.payload),
        selectedCattle: state.selectedCattle?.id === action.payload 
          ? null 
          : state.selectedCattle
      };
    
    case 'SET_QUESTS':
      return { ...state, quests: action.payload };
    
    case 'SET_ACTIVE_QUEST':
      return { ...state, activeQuest: action.payload };
    
    case 'UPDATE_QUEST_PROGRESS':
      return {
        ...state,
        quests: state.quests.map(quest => 
          quest.id === action.payload.id 
            ? { 
                ...quest, 
                goal: { 
                  ...quest.goal, 
                  current: action.payload.progress 
                } 
              } 
            : quest
        ),
        activeQuest: state.activeQuest?.id === action.payload.id
          ? {
              ...state.activeQuest,
              goal: {
                ...state.activeQuest.goal,
                current: action.payload.progress
              }
            }
          : state.activeQuest
      };
    
    case 'COMPLETE_QUEST':
      return {
        ...state,
        quests: state.quests.map(quest => 
          quest.id === action.payload 
            ? { ...quest, completed: true } 
            : quest
        ),
        activeQuest: state.activeQuest?.id === action.payload
          ? { ...state.activeQuest, completed: true }
          : state.activeQuest
      };
    
    case 'SET_SELECTED_CATTLE':
      return { ...state, selectedCattle: action.payload };
    
    case 'SET_SELECTED_TILE':
      return { ...state, selectedTile: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
    
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    
    case 'CLEAR_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification !== action.payload)
      };
    
    case 'SHOW_QUEST_NOTIFICATION':
      return { ...state, showQuestNotification: true };
    
    case 'HIDE_QUEST_NOTIFICATION':
      return { ...state, showQuestNotification: false };
    
    default:
      return state;
  }
}

// Provider component
export const GameStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  
  // Game action functions
  const feedCattle = async (cattleId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if player has enough BT tokens to feed
      if (!gameState.player || gameState.player.btBalance < 20) {
        throw new Error('Not enough BT tokens to feed cattle');
      }
      
      const cattle = gameState.cattle.find(c => c.id === cattleId);
      if (!cattle) {
        throw new Error('Cattle not found');
      }
      
      // Update cattle feeding time
      const now = Date.now();
      const updatedCattle = { 
        ...cattle, 
        feedStartTime: now,
        feedEndTime: now + (60 * 1000), // 1 minute for demo
        feedExpiry: now + (24 * 60 * 60 * 1000) // 24 hours 
      };
      
      // Update player balance
      const updatedPlayer = {
        ...gameState.player,
        btBalance: gameState.player.btBalance - 20
      };
      
      // Update state
      dispatch({ type: 'UPDATE_CATTLE', payload: updatedCattle });
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
      
      // Update quest progress if applicable
      const feedQuest = gameState.quests.find(q => 
        q.goal.type === 'feed' && !q.completed
      );
      
      if (feedQuest) {
        dispatch({
          type: 'UPDATE_QUEST_PROGRESS',
          payload: {
            id: feedQuest.id,
            progress: Math.min(feedQuest.goal.current + 1, feedQuest.goal.count)
          }
        });
        
        // Check if quest completed
        if (feedQuest.goal.current + 1 >= feedQuest.goal.count) {
          dispatch({ type: 'COMPLETE_QUEST', payload: feedQuest.id });
          dispatch({ type: 'SHOW_QUEST_NOTIFICATION' });
          dispatch({ type: 'SET_ACTIVE_QUEST', payload: feedQuest });
          
          // Award quest rewards
          if (feedQuest.reward.btTokens) {
            dispatch({
              type: 'SET_PLAYER',
              payload: {
                ...updatedPlayer,
                btBalance: updatedPlayer.btBalance + feedQuest.reward.btTokens
              }
            });
          }
        }
      }
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const milkCow = async (cattleId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const cattle = gameState.cattle.find(c => c.id === cattleId);
      if (!cattle) {
        throw new Error('Cattle not found');
      }
      
      if (cattle.type !== 'milk_cow') {
        throw new Error('Only milk cows can produce milk');
      }
      
      if (!cattle.readyAt || Date.now() < cattle.readyAt) {
        throw new Error('Cow is not ready for milking yet');
      }
      
      // Calculate milk production (5-10 BT tokens)
      const milkProduction = Math.floor(Math.random() * 6) + 5;
      
      // Update cattle
      const updatedCattle = {
        ...cattle,
        readyAt: undefined,
        feedExpiry: undefined
      };
      
      // Update player balance
      const updatedPlayer = {
        ...gameState.player!,
        btBalance: gameState.player!.btBalance + milkProduction
      };
      
      // Update state
      dispatch({ type: 'UPDATE_CATTLE', payload: updatedCattle });
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
      
      // Update quest progress if applicable
      const milkQuest = gameState.quests.find(q => 
        q.goal.type === 'milk' && !q.completed
      );
      
      if (milkQuest) {
        dispatch({
          type: 'UPDATE_QUEST_PROGRESS',
          payload: {
            id: milkQuest.id,
            progress: Math.min(milkQuest.goal.current + 1, milkQuest.goal.count)
          }
        });
        
        // Check if quest completed
        if (milkQuest.goal.current + 1 >= milkQuest.goal.count) {
          dispatch({ type: 'COMPLETE_QUEST', payload: milkQuest.id });
          dispatch({ type: 'SHOW_QUEST_NOTIFICATION' });
          dispatch({ type: 'SET_ACTIVE_QUEST', payload: milkQuest });
          
          // Award quest rewards
          if (milkQuest.reward.btTokens) {
            dispatch({
              type: 'SET_PLAYER',
              payload: {
                ...updatedPlayer,
                btBalance: updatedPlayer.btBalance + milkQuest.reward.btTokens
              }
            });
          }
        }
      }
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: `Collected ${milkProduction} BT tokens of milk!` });
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const plantPassture = async (tileId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if player has enough BT tokens to plant
      if (!gameState.player || gameState.player.btBalance < 10) {
        throw new Error('Not enough BT tokens to plant pasture');
      }
      
      const tile = gameState.ranchTiles.find(t => t.id === tileId);
      if (!tile) {
        throw new Error('Tile not found');
      }
      
      if (tile.isLocked) {
        throw new Error('Tile is locked');
      }
      
      if (tile.hasPassture) {
        throw new Error('Tile already has pasture');
      }
      
      // Update tile
      const now = Date.now();
      const updatedTile = {
        ...tile,
        hasPassture: true,
        growthStartTime: now,
        growthEndTime: now + (10 * 1000), // 10 seconds for demo
        status: 'growing' as const
      };
      
      // Update player balance
      const updatedPlayer = {
        ...gameState.player,
        btBalance: gameState.player.btBalance - 10
      };
      
      // Update state
      dispatch({ type: 'UPDATE_RANCH_TILE', payload: updatedTile });
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
      
      // Set timer to update growth status
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_RANCH_TILE',
          payload: {
            ...updatedTile,
            status: 'ready' as const
          }
        });
        
        dispatch({ type: 'ADD_NOTIFICATION', payload: 'Pasture is ready for harvest!' });
      }, 10000);
      
      // Update quest progress if applicable
      const plantQuest = gameState.quests.find(q => 
        q.goal.type === 'plant' && !q.completed
      );
      
      if (plantQuest) {
        dispatch({
          type: 'UPDATE_QUEST_PROGRESS',
          payload: {
            id: plantQuest.id,
            progress: Math.min(plantQuest.goal.current + 1, plantQuest.goal.count)
          }
        });
        
        // Check if quest completed
        if (plantQuest.goal.current + 1 >= plantQuest.goal.count) {
          dispatch({ type: 'COMPLETE_QUEST', payload: plantQuest.id });
          dispatch({ type: 'SHOW_QUEST_NOTIFICATION' });
          dispatch({ type: 'SET_ACTIVE_QUEST', payload: plantQuest });
          
          // Award quest rewards
          if (plantQuest.reward.btTokens) {
            dispatch({
              type: 'SET_PLAYER',
              payload: {
                ...updatedPlayer,
                btBalance: updatedPlayer.btBalance + plantQuest.reward.btTokens
              }
            });
          }
        }
      }
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const createLab = async (tileId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if player has enough BC tokens to create a lab
      if (!gameState.player || gameState.player.bcBalance < 50) {
        throw new Error('Not enough BC tokens to create a lab');
      }
      
      const tile = gameState.shadowMarketTiles.find(t => t.id === tileId);
      if (!tile) {
        throw new Error('Tile not found');
      }
      
      if (tile.isLocked) {
        throw new Error('Tile is locked');
      }
      
      if (tile.hasLab) {
        throw new Error('Tile already has a lab');
      }
      
      // Update tile
      const updatedTile = {
        ...tile,
        hasLab: true,
        status: 'empty' as const
      };
      
      // Update player balance
      const updatedPlayer = {
        ...gameState.player,
        bcBalance: gameState.player.bcBalance - 50
      };
      
      // Update state
      dispatch({ type: 'UPDATE_SHADOW_MARKET_TILE', payload: updatedTile });
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const startPotionProduction = async (tileId: number, potionType: 'speed' | 'growth' | 'yield') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if player has enough BC tokens to start production
      if (!gameState.player || gameState.player.bcBalance < 20) {
        throw new Error('Not enough BC tokens to start potion production');
      }
      
      const tile = gameState.shadowMarketTiles.find(t => t.id === tileId);
      if (!tile) {
        throw new Error('Tile not found');
      }
      
      if (!tile.hasLab) {
        throw new Error('Tile does not have a lab');
      }
      
      if (tile.status === 'producing' || tile.status === 'ready') {
        throw new Error('Lab is already producing or has a ready potion');
      }
      
      // Update tile
      const now = Date.now();
      const updatedTile = {
        ...tile,
        potionType,
        productionStartTime: now,
        productionEndTime: now + (20 * 1000), // 20 seconds for demo
        status: 'producing' as const
      };
      
      // Update player balance
      const updatedPlayer = {
        ...gameState.player,
        bcBalance: gameState.player.bcBalance - 20
      };
      
      // Update state
      dispatch({ type: 'UPDATE_SHADOW_MARKET_TILE', payload: updatedTile });
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
      
      // Set timer to update production status
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_SHADOW_MARKET_TILE',
          payload: {
            ...updatedTile,
            status: 'ready' as const
          }
        });
        
        dispatch({ type: 'ADD_NOTIFICATION', payload: `${potionType.charAt(0).toUpperCase() + potionType.slice(1)} potion is ready for collection!` });
      }, 20000);
      
      // Update quest progress if applicable
      const produceQuest = gameState.quests.find(q => 
        q.goal.type === 'produce' && !q.completed
      );
      
      if (produceQuest) {
        dispatch({
          type: 'UPDATE_QUEST_PROGRESS',
          payload: {
            id: produceQuest.id,
            progress: Math.min(produceQuest.goal.current + 1, produceQuest.goal.count)
          }
        });
      }
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const collectPotion = async (tileId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const tile = gameState.shadowMarketTiles.find(t => t.id === tileId);
      if (!tile) {
        throw new Error('Tile not found');
      }
      
      if (!tile.hasLab) {
        throw new Error('Tile does not have a lab');
      }
      
      if (tile.status !== 'ready') {
        throw new Error('No potion ready for collection');
      }
      
      // Calculate BC token reward (30-50)
      const bcReward = Math.floor(Math.random() * 21) + 30;
      
      // Update tile
      const updatedTile = {
        ...tile,
        status: 'empty' as const,
        potionType: undefined,
        productionStartTime: undefined,
        productionEndTime: undefined
      };
      
      // Update player balance
      const updatedPlayer = {
        ...gameState.player!,
        bcBalance: gameState.player!.bcBalance + bcReward
      };
      
      // Update state
      dispatch({ type: 'UPDATE_SHADOW_MARKET_TILE', payload: updatedTile });
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: `Collected potion and earned ${bcReward} BC tokens!` });
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const purchaseCattle = async (type: 'milk_cow' | 'beef_cow' | 'bull', name: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Set price based on type
      const price = type === 'bull' ? 100 : type === 'milk_cow' ? 80 : 60;
      
      // Check if player has enough BT tokens
      if (!gameState.player || gameState.player.btBalance < price) {
        throw new Error(`Not enough BT tokens to purchase ${type}`);
      }
      
      // Create new cattle
      const newCattle = {
        id: Date.now(),
        name,
        type,
        quality: Math.floor(Math.random() * 5) + 1, // 1-5 quality
        // Add type-specific properties
        ...(type === 'milk_cow' ? { milkProduction: Math.floor(Math.random() * 3) + 3 } : {}),
        ...(type === 'bull' ? { rodeoStrength: Math.floor(Math.random() * 5) + 1 } : {})
      };
      
      // Update player balance
      const updatedPlayer = {
        ...gameState.player,
        btBalance: gameState.player.btBalance - price
      };
      
      // Update state
      dispatch({ type: 'ADD_CATTLE', payload: newCattle });
      dispatch({ type: 'SET_SELECTED_CATTLE', payload: newCattle });
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: `Purchased ${name} the ${type}!` });
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  return (
    <GameStateContext.Provider value={{ 
      gameState, 
      dispatch,
      feedCattle,
      milkCow,
      plantPassture,
      createLab,
      startPotionProduction,
      collectPotion,
      purchaseCattle
    }}>
      {children}
    </GameStateContext.Provider>
  );
};

// Custom hook for using game state
export const useGameState = () => useContext(GameStateContext);