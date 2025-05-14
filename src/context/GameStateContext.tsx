import React, { createContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction, Notification } from '../types';

// Initial state
const initialState: GameState = {
  player: null,
  quests: [],
  marketPrices: {
    milk: 5,
    hay: 2,
    speedPotion: 30,
    growthPotion: 35,
    yieldPotion: 40,
  },
  notifications: [],
  isLoading: false,
};

// Create context
export const GameStateContext = createContext<{
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  gameState: initialState,
  dispatch: () => null,
});

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return {
        ...state,
        player: action.payload,
      };
      
    case 'UPDATE_PLAYER':
      return {
        ...state,
        player: state.player ? { ...state.player, ...action.payload } : null,
      };
      
    case 'ADD_CATTLE':
      return {
        ...state,
        player: state.player ? {
          ...state.player,
          cattle: [...state.player.cattle, action.payload],
        } : null,
      };
      
    case 'REMOVE_CATTLE':
      return {
        ...state,
        player: state.player ? {
          ...state.player,
          cattle: state.player.cattle.filter(c => c.id !== action.payload),
        } : null,
      };
      
    case 'FEED_CATTLE': {
      if (!state.player) return state;
      
      const updatedCattle = state.player.cattle.map(cattle => 
        cattle.id === action.payload 
          ? { ...cattle, lastFed: Date.now(), healthStatus: 'healthy' as 'healthy' }
          : cattle
      );
      
      return {
        ...state,
        player: {
          ...state.player,
          cattle: updatedCattle,
        },
      };
    }
      
    case 'MILK_COW': {
      if (!state.player) return state;
      
      const updatedCattle = state.player.cattle.map(cattle => 
        cattle.id === action.payload && cattle.type === 'cow'
          ? { ...cattle, lastMilked: Date.now() }
          : cattle
      );
      
      return {
        ...state,
        player: {
          ...state.player,
          cattle: updatedCattle,
        },
      };
    }
      
    case 'PLANT_PASTURE': {
      if (!state.player) return state;
      
      const updatedTiles = state.player.ranchTiles.map(tile => 
        tile.id === action.payload
          ? { ...tile, growthStage: 0, plantedAt: Date.now() }
          : tile
      );
      
      return {
        ...state,
        player: {
          ...state.player,
          ranchTiles: updatedTiles,
        },
      };
    }
      
    case 'HARVEST_PASTURE': {
      if (!state.player) return state;
      
      const updatedTiles = state.player.ranchTiles.map(tile => 
        tile.id === action.payload
          ? { ...tile, growthStage: 0, lastHarvested: Date.now() }
          : tile
      );
      
      return {
        ...state,
        player: {
          ...state.player,
          ranchTiles: updatedTiles,
        },
      };
    }
      
    case 'CREATE_LAB': {
      if (!state.player) return state;
      
      const updatedTiles = state.player.shadowMarketTiles.map(tile => 
        tile.id === action.payload.tileId
          ? { 
              ...tile, 
              type: 'lab' as 'lab', 
              potionType: action.payload.potionType,
              status: 'active' as 'active',
            }
          : tile
      );
      
      return {
        ...state,
        player: {
          ...state.player,
          shadowMarketTiles: updatedTiles,
        },
      };
    }
      
    case 'START_POTION_PRODUCTION': {
      if (!state.player) return state;
      
      const updatedTiles = state.player.shadowMarketTiles.map(tile => 
        tile.id === action.payload && tile.type === 'lab'
          ? { 
              ...tile, 
              productionStarted: Date.now(),
              productionCompleted: Date.now() + (20 * 1000), // 20 seconds production time
            }
          : tile
      );
      
      return {
        ...state,
        player: {
          ...state.player,
          shadowMarketTiles: updatedTiles,
          // Deduct BC tokens for potion production
          bcBalance: state.player.bcBalance - 20, // 20 BC cost per potion
        },
      };
    }
      
    case 'COLLECT_POTION': {
      if (!state.player) return state;
      
      const updatedTiles = state.player.shadowMarketTiles.map(tile => 
        tile.id === action.payload && tile.type === 'lab'
          ? { 
              ...tile, 
              productionStarted: undefined,
              productionCompleted: undefined,
            }
          : tile
      );
      
      // Find the tile to determine potion type
      const tile = state.player.shadowMarketTiles.find(t => t.id === action.payload);
      
      // Add potion to inventory
      const updatedInventory = [...state.player.inventory];
      if (tile?.potionType) {
        const potionType = `${tile.potionType}Potion` as 'speedPotion' | 'growthPotion' | 'yieldPotion';
        const existingItem = updatedInventory.find(item => item.type === potionType);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          updatedInventory.push({
            id: `potion-${Date.now()}`,
            type: potionType,
            quantity: 1,
          });
        }
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          shadowMarketTiles: updatedTiles,
          inventory: updatedInventory,
        },
      };
    }
      
    case 'ADD_QUEST':
      return {
        ...state,
        quests: [...state.quests, action.payload],
      };
      
    case 'UPDATE_QUEST': {
      const updatedQuests = state.quests.map(quest => 
        quest.id === action.payload.questId
          ? { ...quest, ...action.payload.updates }
          : quest
      );
      
      return {
        ...state,
        quests: updatedQuests,
      };
    }
      
    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        id: `notification-${Date.now()}`,
        timestamp: Date.now(),
        isRead: false,
        ...action.payload,
      };
      
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
      };
    }
      
    case 'MARK_NOTIFICATION_READ': {
      const updatedNotifications = state.notifications.map(notification => 
        notification.id === action.payload
          ? { ...notification, isRead: true }
          : notification
      );
      
      return {
        ...state,
        notifications: updatedNotifications,
      };
    }
      
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
      
    default:
      return state;
  }
}

// Provider component
export const GameStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  
  return (
    <GameStateContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
};

export default GameStateContext;