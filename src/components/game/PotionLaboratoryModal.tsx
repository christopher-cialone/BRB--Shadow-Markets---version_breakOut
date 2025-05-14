import React from 'react';
import { useGameState } from '../../hooks/useGameState';

interface PotionLaboratoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProduction: (potionType: 'speed' | 'growth' | 'yield') => void;
}

const PotionLaboratoryModal: React.FC<PotionLaboratoryModalProps> = ({ 
  isOpen, 
  onClose,
  onStartProduction 
}) => {
  const { gameState } = useGameState();
  
  if (!isOpen) return null;
  
  const hasSufficientFunds = gameState.player && gameState.player.bcBalance >= 20;
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Shadow Laboratory</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="mb-4 text-cyan-300">
            Select a potion to brew in your laboratory. Each potion costs 20 BC tokens 
            and takes time to produce, but will yield more BC tokens when sold in the 
            shadow markets.
          </p>
          
          {!hasSufficientFunds && (
            <div className="bg-red-900/30 border border-red-600 text-white p-3 rounded mb-4">
              You don't have enough BC tokens. Potions require 20 BC to produce.
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h4 className="font-pixel text-neon-cyan text-sm mb-2">Speed Potion</h4>
              <div className="text-center text-2xl mb-2">⚡</div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">COST</div>
                <div className="font-bold">20 BC</div>
              </div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">TIME</div>
                <div>20 seconds</div>
              </div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">EFFECT</div>
                <div className="text-sm">Reduces growth and production times</div>
              </div>
              <button
                onClick={() => onStartProduction('speed')}
                disabled={!hasSufficientFunds}
                className={`button button-primary w-full ${!hasSufficientFunds ? 'button-disabled' : ''}`}
              >
                Brew Speed Potion
              </button>
            </div>
            
            <div className="card">
              <h4 className="font-pixel text-neon-cyan text-sm mb-2">Growth Potion</h4>
              <div className="text-center text-2xl mb-2">🌱</div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">COST</div>
                <div className="font-bold">20 BC</div>
              </div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">TIME</div>
                <div>20 seconds</div>
              </div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">EFFECT</div>
                <div className="text-sm">Enhances crop growth rate by 2x</div>
              </div>
              <button
                onClick={() => onStartProduction('growth')}
                disabled={!hasSufficientFunds}
                className={`button button-primary w-full ${!hasSufficientFunds ? 'button-disabled' : ''}`}
              >
                Brew Growth Potion
              </button>
            </div>
            
            <div className="card">
              <h4 className="font-pixel text-neon-cyan text-sm mb-2">Yield Potion</h4>
              <div className="text-center text-2xl mb-2">💰</div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">COST</div>
                <div className="font-bold">20 BC</div>
              </div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">TIME</div>
                <div>20 seconds</div>
              </div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">EFFECT</div>
                <div className="text-sm">Increases harvest and milk yields by 50%</div>
              </div>
              <button
                onClick={() => onStartProduction('yield')}
                disabled={!hasSufficientFunds}
                className={`button button-primary w-full ${!hasSufficientFunds ? 'button-disabled' : ''}`}
              >
                Brew Yield Potion
              </button>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="button button-outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PotionLaboratoryModal;