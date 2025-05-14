import { useContext } from 'react';
import { GameStateContext } from '../context/GameStateContext';

export const useGameState = () => {
  const context = useContext(GameStateContext);
  
  if (!context) {
    throw new Error('useGameState must be used within GameStateProvider');
  }
  
  const { gameState, dispatch } = context;
  
  // Utility functions for common actions
  const feedCattle = (cattleId: string) => {
    dispatch({ type: 'FEED_CATTLE', payload: cattleId });
  };
  
  const milkCow = (cattleId: string) => {
    dispatch({ type: 'MILK_COW', payload: cattleId });
  };
  
  const plantPassture = (tileId: string) => {
    dispatch({ type: 'PLANT_PASTURE', payload: tileId });
  };
  
  const harvestPassture = (tileId: string) => {
    dispatch({ type: 'HARVEST_PASTURE', payload: tileId });
  };
  
  const createLab = (tileId: string, potionType: 'speed' | 'growth' | 'yield') => {
    dispatch({ 
      type: 'CREATE_LAB', 
      payload: { tileId, potionType } 
    });
  };
  
  const startPotionProduction = (tileId: string) => {
    dispatch({ type: 'START_POTION_PRODUCTION', payload: tileId });
  };
  
  const collectPotion = (tileId: string) => {
    dispatch({ type: 'COLLECT_POTION', payload: tileId });
  };
  
  const purchaseCattle = (cattleType: 'cow' | 'bull') => {
    // Create a new cattle
    const newCattle = {
      id: `cattle-${Date.now()}`,
      type: cattleType,
      name: cattleType === 'cow' ? `Cow ${Math.floor(Math.random() * 100)}` : `Bull ${Math.floor(Math.random() * 100)}`,
      level: 1,
      lastFed: Date.now(),
      healthStatus: 'healthy' as const,
    };
    
    // Add cow-specific properties
    if (cattleType === 'cow') {
      Object.assign(newCattle, {
        milkRate: Math.floor(Math.random() * 3) + 1, // 1-3
        lastMilked: 0,
      });
    } else {
      // Add bull-specific properties
      Object.assign(newCattle, {
        breedingRate: Math.floor(Math.random() * 3) + 1, // 1-3
      });
    }
    
    // Add to player's cattle collection
    dispatch({ type: 'ADD_CATTLE', payload: newCattle });
    
    // Update player's balance
    if (gameState.player) {
      dispatch({ 
        type: 'UPDATE_PLAYER', 
        payload: { 
          btBalance: gameState.player.btBalance - (cattleType === 'cow' ? 50 : 75) 
        } 
      });
    }
  };
  
  const addNotification = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type, title, message }
    });
  };
  
  return {
    gameState,
    dispatch,
    feedCattle,
    milkCow,
    plantPassture,
    harvestPassture,
    createLab,
    startPotionProduction,
    collectPotion,
    purchaseCattle,
    addNotification
  };
};

export default useGameState;