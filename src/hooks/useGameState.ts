import { useContext } from 'react';
import { GameStateContext } from '../context/GameStateContext';

export const useGameState = () => useContext(GameStateContext);