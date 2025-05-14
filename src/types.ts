// Game state types
export interface Player {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  btBalance: number; // BT token balance (Ranch currency)
  bcBalance: number; // BC token balance (Shadow Market currency)
  cattle: CattleItem[];
  inventory: InventoryItem[];
  ranchTiles: RanchTile[];
  shadowMarketTiles: ShadowMarketTile[];
}

export interface CattleItem {
  id: string;
  type: 'cow' | 'bull';
  name: string;
  level: number;
  milkRate?: number; // For cows only
  breedingRate?: number; // For bulls only
  lastMilked?: number; // Timestamp
  lastFed: number; // Timestamp
  healthStatus: 'healthy' | 'sick' | 'hungry';
}

export interface InventoryItem {
  id: string;
  type: 'hay' | 'water' | 'medicine' | 'speedPotion' | 'growthPotion' | 'yieldPotion';
  quantity: number;
}

export interface RanchTile {
  id: string;
  position: number;
  type: 'empty' | 'pasture' | 'barn' | 'water';
  status: 'active' | 'locked';
  cattleId?: string; // If a cattle is assigned to this tile
  growthStage?: number; // For pastures (0-3)
  plantedAt?: number; // Timestamp when pasture was planted
  lastHarvested?: number; // Timestamp when pasture was last harvested
}

export interface ShadowMarketTile {
  id: string;
  position: number;
  type: 'empty' | 'lab' | 'market' | 'staking';
  status: 'active' | 'locked';
  potionType?: 'speed' | 'growth' | 'yield';
  productionStarted?: number; // Timestamp
  productionCompleted?: number; // Timestamp
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'main' | 'side';
  objectives: QuestObjective[];
  reward: QuestReward;
  status: 'inactive' | 'active' | 'completed' | 'claimed';
}

export interface QuestObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  type: 'feed' | 'breed' | 'milk' | 'harvest' | 'craft' | 'sell' | 'race';
}

export interface QuestReward {
  btTokens?: number;
  bcTokens?: number;
  xp?: number;
  item?: string;
}

export interface GameState {
  player: Player | null;
  quests: Quest[];
  marketPrices: {
    milk: number;
    hay: number;
    speedPotion: number;
    growthPotion: number;
    yieldPotion: number;
  };
  notifications: Notification[];
  isLoading: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

// Action types for reducers
export type GameAction =
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'UPDATE_PLAYER'; payload: Partial<Player> }
  | { type: 'ADD_CATTLE'; payload: CattleItem }
  | { type: 'REMOVE_CATTLE'; payload: string } // cattleId
  | { type: 'FEED_CATTLE'; payload: string } // cattleId
  | { type: 'MILK_COW'; payload: string } // cattleId
  | { type: 'PLANT_PASTURE'; payload: string } // tileId
  | { type: 'HARVEST_PASTURE'; payload: string } // tileId
  | { type: 'CREATE_LAB'; payload: { tileId: string; potionType: 'speed' | 'growth' | 'yield' } }
  | { type: 'START_POTION_PRODUCTION'; payload: string } // tileId
  | { type: 'COLLECT_POTION'; payload: string } // tileId
  | { type: 'ADD_QUEST'; payload: Quest }
  | { type: 'UPDATE_QUEST'; payload: { questId: string; updates: Partial<Quest> } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'isRead'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string } // notificationId
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_LOADING'; payload: boolean };