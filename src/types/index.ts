// Game state types
export type Screen = 'main' | 'ranch' | 'shadowMarket' | 'saloon' | 'profile';

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  btBalance: number;
  bcBalance: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  archetype?: string;
}

export interface RanchTile {
  id: number;
  position: Position;
  hasPassture: boolean;
  isLocked: boolean;
  growthStartTime?: number;
  growthEndTime?: number;
  status?: 'empty' | 'growing' | 'ready';
}

export interface ShadowMarketTile {
  id: number;
  position: Position;
  hasLab: boolean;
  isLocked: boolean;
  productionStartTime?: number;
  productionEndTime?: number;
  status?: 'empty' | 'producing' | 'ready';
  potionType?: 'speed' | 'growth' | 'yield';
}

export interface Cattle {
  id: number;
  name: string;
  type: 'milk_cow' | 'beef_cow' | 'bull';
  quality: number;
  feedStartTime?: number;
  feedEndTime?: number;
  readyAt?: number;
  feedExpiry?: number;
  milkProduction?: number;
  rodeoStrength?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  goal: {
    type: 'plant' | 'harvest' | 'feed' | 'milk' | 'produce' | 'rodeo';
    count: number;
    current: number;
  };
  reward: {
    btTokens?: number;
    bcTokens?: number;
    xp?: number;
    item?: string;
  };
  expiresAt?: number;
  completed: boolean;
}

export interface GameState {
  player: Player | null;
  ranchTiles: RanchTile[];
  shadowMarketTiles: ShadowMarketTile[];
  cattle: Cattle[];
  quests: Quest[];
  activeQuest: Quest | null;
  selectedCattle: Cattle | null;
  selectedTile: RanchTile | ShadowMarketTile | null;
  loading: boolean;
  error: string | null;
  screen: Screen;
  notifications: string[];
  showQuestNotification: boolean;
}

export type GameAction =
  | { type: 'SET_PLAYER', payload: Player }
  | { type: 'SET_RANCH_TILES', payload: RanchTile[] }
  | { type: 'ADD_RANCH_TILE', payload: RanchTile }
  | { type: 'UPDATE_RANCH_TILE', payload: RanchTile }
  | { type: 'SET_SHADOW_MARKET_TILES', payload: ShadowMarketTile[] }
  | { type: 'ADD_SHADOW_MARKET_TILE', payload: ShadowMarketTile }
  | { type: 'UPDATE_SHADOW_MARKET_TILE', payload: ShadowMarketTile }
  | { type: 'SET_CATTLE', payload: Cattle[] }
  | { type: 'ADD_CATTLE', payload: Cattle }
  | { type: 'UPDATE_CATTLE', payload: Cattle }
  | { type: 'REMOVE_CATTLE', payload: number }
  | { type: 'SET_QUESTS', payload: Quest[] }
  | { type: 'SET_ACTIVE_QUEST', payload: Quest | null }
  | { type: 'UPDATE_QUEST_PROGRESS', payload: { id: string, progress: number } }
  | { type: 'COMPLETE_QUEST', payload: string }
  | { type: 'SET_SELECTED_CATTLE', payload: Cattle | null }
  | { type: 'SET_SELECTED_TILE', payload: RanchTile | ShadowMarketTile | null }
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_ERROR', payload: string | null }
  | { type: 'SET_SCREEN', payload: Screen }
  | { type: 'ADD_NOTIFICATION', payload: string }
  | { type: 'CLEAR_NOTIFICATION', payload: string }
  | { type: 'SHOW_QUEST_NOTIFICATION' }
  | { type: 'HIDE_QUEST_NOTIFICATION' };